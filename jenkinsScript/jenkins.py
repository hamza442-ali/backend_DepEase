import requests
from flask import Flask, request, jsonify
from jenkinsapi.jenkins import Jenkins

app = Flask(__name__)

JENKINS_URL = "http://localhost:8080"
USERNAME = "abdullah"
PASSWORD = "jenkinsE2r5oiq2"
API_TOKEN = "11b6766e5fe3fa2e331e41064c9317e6b8"
jenkins_session = None

def jenkins_login():
    global jenkins_session
    try:
        jenkins = Jenkins(JENKINS_URL, username=USERNAME, password=PASSWORD)
        if jenkins.poll():
            jenkins_session = jenkins
            return jenkins
        else:
            return None
    except Exception as e:
        print(f"Failed to login to Jenkins: {str(e)}")
        return None

def get_crumb():
    try:
        response = requests.get(f"{JENKINS_URL}/crumbIssuer/api/json", auth=(USERNAME, API_TOKEN))
        response.raise_for_status()
        crumb = response.json()
        crumb_field = crumb.get("crumbRequestField")
        crumb_value = crumb.get("crumb")
        return crumb_field, crumb_value
    except Exception as e:
        print(f"Failed to get Jenkins crumb: {str(e)}")
        return None, None

@app.route('/login', methods=['POST'])
def login():
    session = jenkins_login()
    if session:
        return jsonify({"message": "Login successful"})
    else:
        return jsonify({"message": "Login failed"}), 401



@app.route('/create_job', methods=['POST'])
def create_pipeline_job():
    data = request.json
    job_name = data.get('job_name')
    git_repo_url = data.get('git_repo_url', '')
    git_branch = data.get('git_branch', 'main')  # default to main branch

    if not job_name or not git_repo_url:
        return jsonify({"error": "Job name and Git repository URL are required"}), 400

    try:
        jenkins = Jenkins(JENKINS_URL, username=USERNAME, password=PASSWORD)

        # Jenkins job config XML with SCM configured for Git
        config_xml = f"""<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.40">
  <description></description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
      <triggers/>
    </org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps@2.92">
    <scm class="hudson.plugins.git.GitSCM" plugin="git@4.7.0">
      <configVersion>2</configVersion>
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>{git_repo_url}</url>
        </hudson.plugins.git.UserRemoteConfig>
      </userRemoteConfigs>
      <branches>
        <hudson.plugins.git.BranchSpec>
          <name>{git_branch}</name>
        </hudson.plugins.git.BranchSpec>
      </branches>
      <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
      <submoduleCfg class="list"/>
      <extensions/>
    </scm>
    <scriptPath>Jenkinsfile</scriptPath>
    <lightweight>true</lightweight>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>"""

        # Create pipeline job with the configured XML
        jenkins.create_job(jobname=job_name, xml=config_xml)

        return jsonify({"message": f"Pipeline job '{job_name}' created successfully"}), 200
    except Exception as e:
        error_message = f"Failed to create pipeline job '{job_name}': {str(e)}"
        print(error_message)
        return jsonify({"error": error_message}), 500


@app.route('/build_pipeline', methods=['POST'])
def build_job():
    global jenkins_session
    if not jenkins_session:
        jenkins_login()

    data = request.json
    job_name = data.get('job_name')

    if not job_name:
        return jsonify({"error": "Job name is required"}), 400

    try:
        if job_name in jenkins_session.jobs:
            jenkins_session.build_job(job_name)
            return jsonify({"message": f"Build triggered for job '{job_name}'"}), 200
        else:
            return jsonify({"error": f"Job '{job_name}' not found"}), 404
    except Exception as e:
        error_message = f"Failed to trigger build for job '{job_name}': {str(e)}"
        print(error_message)
        return jsonify({"error": error_message}), 500



@app.route('/delete_pipeline', methods=['DELETE'])
def delete_job():
    global jenkins_session
    if not jenkins_session:
        jenkins_login()

    data = request.json
    job_name = data.get('job_name')

    if not job_name:
        return jsonify({"error": "Job name is required"}), 400

    try:
        if job_name in jenkins_session.jobs:
            jenkins_session.delete_job(job_name)
            return jsonify({"message": f"Job '{job_name}' deleted successfully"}), 200
        else:
            return jsonify({"error": f"Job '{job_name}' not found"}), 404
    except Exception as e:
        error_message = f"Failed to delete job '{job_name}': {str(e)}"
        print(error_message)
        return jsonify({"error": error_message}), 500


if __name__ == '__main__':
    app.run(debug=True)
