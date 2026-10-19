import jenkins.model.Jenkins
import jenkins.model.JenkinsLocationConfiguration
import hudson.model.User
import hudson.model.Node
import hudson.model.Item
import hudson.slaves.DumbSlave
import hudson.slaves.JNLPLauncher
import hudson.security.HudsonPrivateSecurityRealm
import hudson.security.GlobalMatrixAuthorizationStrategy
import jenkins.security.ApiTokenProperty
import org.jenkinsci.plugins.matrixauth.PermissionEntry
import java.nio.file.Files
import java.nio.file.attribute.PosixFilePermissions

if (System.getenv('LOCAL_JENKINS_BOOTSTRAP') != 'true') {
    throw new IllegalStateException('This image is for the explicitly configured local development stack')
}
def server = Jenkins.get()
def password = System.getenv('DEPEASE_JENKINS_ADMIN_PASSWORD')
def realm = server.securityRealm instanceof HudsonPrivateSecurityRealm ? server.securityRealm : new HudsonPrivateSecurityRealm(false)
server.setSecurityRealm(realm)
def strategy = new GlobalMatrixAuthorizationStrategy()
strategy.add(Jenkins.ADMINISTER, PermissionEntry.user('depease-admin'))
strategy.add(Jenkins.READ, PermissionEntry.user('depease-service'))
[Item.READ, Item.DISCOVER, Item.CREATE, Item.CONFIGURE, Item.BUILD, Item.CANCEL, Item.DELETE].each { strategy.add(it, PermissionEntry.user('depease-service')) }
server.setAuthorizationStrategy(strategy)
server.setNumExecutors(0)
server.setSlaveAgentPort(-1)
server.save()
if (!password || password.length() < 32 || password.length() > 72) throw new IllegalStateException('A generated administrator password of 32 to 72 characters is required')
if (User.getById('depease-admin', false)?.getProperty(HudsonPrivateSecurityRealm.Details) == null) realm.createAccount('depease-admin', password)
if (User.getById('depease-service', false)?.getProperty(HudsonPrivateSecurityRealm.Details) == null) realm.createAccount('depease-service', UUID.randomUUID().toString() + UUID.randomUUID().toString())
JenkinsLocationConfiguration.get().setUrl('http://localhost:8082/')

def saveSecret = { String filename, String value ->
    def file = new File(filename)
    Files.writeString(file.toPath(), value)
    Files.setPosixFilePermissions(file.toPath(), PosixFilePermissions.fromString('rw-r-----'))
}
def service = User.getById('depease-service', true)
def property = service.getProperty(ApiTokenProperty)
def apiFile = new File('/run/depease-api/api-token')
if (!apiFile.exists() || !property.tokenStore.tokenList.any { it.name == 'DepEase local bridge' }) {
    def token = property.tokenStore.generateNewToken('DepEase local bridge')
    service.save()
    saveSecret(apiFile.path, token.plainValue)
}
def node = server.getNode('depease-dev')
if (node == null) {
    node = new DumbSlave('depease-dev', '/home/jenkins/agent', new JNLPLauncher())
    node.setNumExecutors(1)
    node.setMode(Node.Mode.EXCLUSIVE)
    node.setLabelString('depease-local')
    server.addNode(node)
}
saveSecret('/run/depease-agent/agent-secret', node.toComputer().getJnlpMac())
server.save()
println('DepEase local Jenkins configuration is ready; credentials remain in private files.')
