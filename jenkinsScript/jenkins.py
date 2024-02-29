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

@app.route('/create_job', methods=['POST'])
def create_job():
    job_name = "try1"  # Hardcoded for testing purposes
    if not job_name:
        return jsonify({"error": "Job name is required"}), 400

    try:
        jenkins = Jenkins(JENKINS_URL, username=USERNAME, password=PASSWORD)
        # Minimal XML configuration for the job
        job_config = """<project><builders/><publishers/><buildWrappers/></project>"""
        job = jenkins.create_job(job_name, xml=job_config)
        return jsonify({"message": f"Job '{job_name}' created successfully"}), 200
    except Exception as e:
        error_message = f"Failed to create job '{job_name}': {str(e)}"
        print(error_message)
        return jsonify({"error": error_message}), 500




if __name__ == '__main__':
    app.run(debug=True)
