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




// Define Express route handler
const createJenkinsJob = async (req, res) => {
  try {
    const data = {
      git_repo_url: req.body.repo_url,
      git_branch: req.body.git_branch,
      job_name: req.body.job_name,
    };

    // Make Axios POST request to Flask route
    const response = await axios.post(`${Flask_URL}/create_job`, data);

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

const deleteJenkinsJob = async (req, res) => {
  try {
    const { job_name } = req.body;

    // Make a DELETE request to the Flask API
    const response = await axios.delete(`${Flask_URL}/delete_pipeline`, {
        data: { job_name },
        headers: { 'Content-Type': 'application/json' }
    });

    // Return the response from Flask
    res.status(response.status).json(response.data);
} catch (error) {
    // Handle errors
    if (error.response) {
        res.status(error.response.status).json(error.response.data);
    } else {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
};



const buildJenkinsJob = async (req, res) => {
  const { job_name } = req.body;

  if (!job_name) {
      return res.status(400).json({ error: "Job name is required" });
  }

  try {
      // Make a POST request to the Flask route
      const response = await axios.post(`${Flask_URL}/build_pipeline`, {
          job_name: job_name
      });

      // Return the response from Flask
      return res.status(response.status).json(response.data);
  } catch (error) {
      // If an error occurs, return an error response
      return res.status(500).json({ error: error.message });
  }
};


module.exports = { loginToJenkins, createJenkinsJob,  deleteJenkinsJob,buildJenkinsJob};


