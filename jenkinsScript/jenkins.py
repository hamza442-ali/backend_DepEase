"""Private Jenkins bridge. Expose only to the Node API on a private network."""
import hmac
import os
import re
import time
from urllib.parse import urlparse
from xml.sax.saxutils import escape

import requests
from flask import Flask, jsonify, request
from werkzeug.exceptions import HTTPException

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024
JOB_PATTERN = re.compile(r'^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$')


class BridgeError(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.status = status


@app.errorhandler(BridgeError)
def bridge_error(error):
    return jsonify(error=str(error)), error.status


@app.errorhandler(requests.RequestException)
def upstream_error(error):
    # Upstream exceptions can contain credentials and private URLs.
    return jsonify(error='Jenkins request failed'), 502


@app.errorhandler(HTTPException)
def http_error(error):
    return jsonify(error=error.name), error.code


@app.before_request
def authenticate_bridge():
    token = os.environ.get('JENKINS_BRIDGE_TOKEN', '')
    if len(token) < 32:
        raise BridgeError('Bridge is not configured', 503)
    supplied = request.headers.get('X-Bridge-Token', '')
    if not hmac.compare_digest(token.encode(), supplied.encode()):
        raise BridgeError('Unauthorized', 401)


def payload():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise BridgeError('A JSON object is required')
    name = data.get('job_name')
    if not isinstance(name, str) or not JOB_PATTERN.fullmatch(name):
        raise BridgeError('Invalid job name')
    return data, name


def client():
    url = os.environ.get('JENKINS_URL', '').rstrip('/')
    username = os.environ.get('JENKINS_USER')
    token = os.environ.get('JENKINS_API_TOKEN')
    if not url or not username or not token:
        raise BridgeError('Jenkins is not configured', 503)
    parsed = urlparse(url)
    if parsed.scheme not in ('http', 'https') or not parsed.hostname or parsed.username or parsed.password:
        raise BridgeError('Jenkins URL is invalid', 503)
    session = requests.Session()
    session.auth = (username, token)
    return url, session


def call(session, method, url, **kwargs):
    response = session.request(method, url, timeout=(5, 10), allow_redirects=False, **kwargs)
    if response.status_code >= 400 or response.status_code in (301, 302, 303, 307, 308):
        raise BridgeError('Jenkins request failed', 502)
    return response


@app.post('/login')
def login():
    url, session = client()
    with session:
        call(session, 'GET', url + '/api/json')
    return jsonify(message='Login successful')


@app.post('/create_job')
def create_job():
    data, name = payload()
    repository = data.get('git_repo_url')
    if not isinstance(repository, str):
        raise BridgeError('Repository URL is required')
    repo = urlparse(repository)
    try:
        port = repo.port
    except ValueError:
        raise BridgeError('Repository URL is invalid')
    if (repo.scheme != 'https' or repo.hostname not in ('github.com', 'gitlab.com', 'bitbucket.org')
            or repo.username or repo.password or repo.query or repo.fragment or port
            or len([part for part in repo.path.split('/') if part]) < 2):
        raise BridgeError('Use an HTTPS GitHub, GitLab or Bitbucket repository URL')
    # XML escaping keeps repository input out of the Jenkins configuration structure.
    config = f'''<?xml version="1.0" encoding="UTF-8"?>
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
    url, session = client()
    with session:
        call(session, 'POST', url + '/createItem', params={'name': name}, data=config.encode(), headers={'Content-Type': 'application/xml'})
    return jsonify(message='Pipeline job created successfully')


@app.post('/build_pipeline')
def build_pipeline():
    data, name = payload()
    if not isinstance(data.get('param_value'), bool):
        raise BridgeError('param_value must be a boolean')
    url, session = client()
    deadline = time.monotonic() + 90
    with session:
        response = call(session, 'POST', f'{url}/job/{name}/buildWithParameters', data={'PARAM_NAME': str(data['param_value']).lower()})
        # Track the queue item from this invocation, not a previous last_build result.
        match = re.search(r'/queue/item/(\d+)/?$', response.headers.get('Location', ''))
        if not match:
            raise BridgeError('Jenkins did not return a queue item', 502)
        queue_id = int(match.group(1))
        number = None
        while time.monotonic() < deadline:
            queued = call(session, 'GET', f'{url}/queue/item/{queue_id}/api/json').json()
            if queued.get('cancelled'):
                raise BridgeError('Jenkins build was cancelled', 409)
            number = queued.get('executable', {}).get('number')
            if isinstance(number, int):
                break
            time.sleep(2)
        while isinstance(number, int) and time.monotonic() < deadline:
            build = call(session, 'GET', f'{url}/job/{name}/{number}/api/json').json()
            if not build.get('building') and build.get('result'):
                if build['result'] != 'SUCCESS':
                    return jsonify(error='Jenkins build failed', result=build['result'], buildNumber=number), 502
                # Do not send Jenkins console output to clients; it may contain secrets.
                console = call(session, 'GET', f'{url}/job/{name}/{number}/consoleText').text
                deployment = next((line.partition(':')[2].strip() for line in console.splitlines() if line.startswith('deployedLink:')), '')
                return jsonify(message='Build succeeded', deploymentLink=deployment, buildNumber=number, result='SUCCESS')
            time.sleep(2)
    return jsonify(message='Build is queued or running', queueId=queue_id, buildNumber=number, deploymentLink=''), 202


@app.delete('/delete_pipeline')
def delete_pipeline():
    _, name = payload()
    url, session = client()
    with session:
        # Jenkins normally redirects to its dashboard after a successful deletion.
        response = session.post(f'{url}/job/{name}/doDelete', timeout=(5, 10), allow_redirects=False)
        if response.status_code not in (200, 201, 204, 302, 303):
            raise BridgeError('Jenkins deletion failed', 502)
    return jsonify(message='Job deleted successfully')


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False)
