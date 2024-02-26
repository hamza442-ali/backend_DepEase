from flask import Flask, request, jsonify
from jenkinsapi.jenkins import Jenkins
import requests

app = Flask(__name__)

JENKINS_URL = "http://localhost:8080"
USERNAME = "abdullah"
PASSWORD = "jenkinsE2r5oiq2"

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

def create_pipeline(repo_url):
    global jenkins_session
    if not jenkins_session:
        jenkins_login()
    if jenkins_session:
        try:
            pipeline_name = repo_url.split('/')[-1].replace('.git', '')  # Extracting pipeline name from GitHub repo URL
            jenkinsfile_url = f"{repo_url.rstrip('.git')}/raw/main/Jenkinsfile"
            # print("Jenkinsfile URL:", jenkinsfile_url)  # Debugging print statement
            response = requests.get(jenkinsfile_url)
            if response.status_code == 200:
                pipeline_script = response.text
                job_config = {
                    'element': 'org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject',
                    'name': pipeline_name,
                    'script': pipeline_script
                }
                # Try creating the job, handle errors
                try:
                    jenkins_session.create_job(pipeline_name, job_config)
                    return True
                except Exception as job_creation_error:
                    print(f"Failed to create Jenkins pipeline job: {str(job_creation_error)}")
                    return False
            else:
                print(f"Failed to fetch Jenkinsfile from {jenkinsfile_url}. Status code: {response.status_code}")
                return False
        except Exception as e:
            print(f"Failed to create Jenkins pipeline: {str(e)}")
            return False
    else:
        print("Jenkins session not initialized.")
        return False


@app.route('/login', methods=['POST'])
def login():
    session = jenkins_login()
    
    if session:
        return jsonify({"message": "Login successful"})
    else:
        return jsonify({"message": "Login failed"}), 401

@app.route('/check_jenkins', methods=['GET'])
def check_jenkins():
    global jenkins_session
    if not jenkins_session:
        jenkins_login()
    if jenkins_session:
        try:
            jobs_count = len(jenkins_session)
            message = 'Jenkins server has %d jobs.' % jobs_count
            return jsonify({"message": message}), 200
        except Exception as e:
            error_message = f"Failed to check Jenkins status: {str(e)}"
            print(error_message)
            return jsonify({"error": error_message}), 500
    else:
        error_message = "Jenkins session not initialized."
        print(error_message)
        return jsonify({"error": error_message}), 500

@app.route('/create_pipeline', methods=['POST'])
def create_jenkins_pipeline():
    if request.method == 'POST':
        data = request.get_json()
        print("Received data:", data)  # Debugging print statement
        if 'repo_url' in data:
            repo_url = data['repo_url']
            print("Repo URL:", repo_url)  # Debugging print statement
            if create_pipeline(repo_url):
                return jsonify({"message": "Jenkins pipeline created successfully"}), 201
            else:
                return jsonify({"message": "Failed to create Jenkins pipeline"}), 500
        else:
            return jsonify({"message": "Repo URL not provided"}), 400
    else:
        return jsonify({"message": "Method not allowed"}), 405

if __name__ == '__main__':
    app.run(debug=True)
