const express = require('express');
const axios = require('axios');

const router = express.Router();

const username = "abdullah"; 
const password = "jenkinsE2r5oiq2";
const JENKINS_API_TOKEN = '11932898a8d0e90b24fabf9402757d4d62';
const JENKINS_BASE_URL = 'http://localhost:8080/';
const GITHUB_USERNAME = 'abdullah117765';
const GITHUB_TOKEN = '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';

let jenkinsCookie = null;

const Flask_URL = "http://127.0.0.1:5000";

async function loginToJenkins(req, res) {
  try {
    
    const response = await axios.post(`${Flask_URL}/login`);
    
    if (response.data.message === "Login successful") {
        res.status(200).json({ message: response.data.message });
    } else {
        res.status(401).json({ message: response.data.message });
    }
} catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({ message: "Internal server error" });
}
}


async function checkJob(req, res) {
  try {
    
    const response = await axios.get(`${Flask_URL}/check_jenkins`);
    
    if (response.data) {
        res.status(200).json({ message: response.data.message });
    } else {
        res.status(401).json({ message: response.data.message });
    }
} catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({ message: response.data.message });
}
}

// Define Express route handler
const createJenkinsJob = async (req, res) => {
  try {
    const data = {
      repo_url: "https://github.com/abdullah117765/demoJenkins.git" // Assuming the repo URL is sent in the request body
    };

    // Make Axios POST request to Flask route
    const response = await axios.post(`${Flask_URL}/create_pipeline`, data);

    // Respond with the response received from Flask
    res.status(response.status).json(response.data);
  } catch (error) {
    // If an error occurs during the Axios request, handle it and respond accordingly
    if (error.response) {
      // The request was made and the server responded with a status code outside of 2xx
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      res.status(500).json({ message: 'Failed to create Jenkins job' });
    } else {
      // Something happened in setting up the request that triggered an error
      res.status(500).json({ message: 'Error making request to server' });
    }
  }
};


module.exports = { loginToJenkins, createJenkinsJob, checkJob };


