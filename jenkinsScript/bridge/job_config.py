"""Generate the Jenkins SCM pipeline configuration."""
from xml.sax.saxutils import escape


def pipeline_xml(repository):
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<flow-definition plugin="workflow-job">
  <description>Managed by DepEase</description>
  <properties>
    <hudson.model.ParametersDefinitionProperty><parameterDefinitions>
      <hudson.model.BooleanParameterDefinition><name>PARAM_NAME</name><defaultValue>true</defaultValue></hudson.model.BooleanParameterDefinition>
    </parameterDefinitions></hudson.model.ParametersDefinitionProperty>
    <jenkins.model.BuildDiscarderProperty><strategy class="hudson.tasks.LogRotator"><numToKeep>10</numToKeep></strategy></jenkins.model.BuildDiscarderProperty>
    <org.jenkinsci.plugins.workflow.job.properties.DisableConcurrentBuildsJobProperty/>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps">
    <scm class="hudson.plugins.git.GitSCM" plugin="git"><configVersion>2</configVersion>
      <userRemoteConfigs><hudson.plugins.git.UserRemoteConfig><url>{escape(repository)}</url></hudson.plugins.git.UserRemoteConfig></userRemoteConfigs>
      <branches><hudson.plugins.git.BranchSpec><name>*/main</name></hudson.plugins.git.BranchSpec></branches>
      <extensions/>
    </scm><scriptPath>Jenkinsfile</scriptPath><lightweight>true</lightweight>
  </definition><disabled>false</disabled>
</flow-definition>'''
