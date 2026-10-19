pipeline {
    agent { label 'depease-local' }
    options {
        timeout(time: 20, unit: 'MINUTES')
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }
    stages {
        stage('Install API dependencies') { steps { sh 'npm ci' } }
        stage('Check API') { steps { sh 'npm run check && npm run format:check && npm test' } }
        stage('Check bridge') {
            steps {
                sh 'python3 -m venv .venv && .venv/bin/pip install -r jenkinsScript/requirements.txt'
                sh '.venv/bin/python -m unittest discover -s jenkinsScript/tests'
            }
        }
    }
    // Database integration and container builds run in GitHub Actions.
    // Add a deployment stage for your hosting target; archive depease-deployment.json
    // containing its actual {"url":"https://your-api.example"} after publishing.
}
