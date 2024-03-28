const express = require("express");
const axios = require("axios");
const Pipeline = require("../model/pipelineModel");
const router = express.Router();

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
      git_repo_url: req.body.githubLink,
      ProjectId: req.body.ProjectId,
      selectedTool: req.body.selectedTool,
      job_name: req.body.jobname,
      deploymentLink: " ",
      Type: req.body.Type,
    };

    // Check if job name already exists in the database
    const existingJob = await Pipeline.findOne({ job_name: data.job_name });

    if (existingJob) {
      console.log("Job name already exists");
      // Job name already exists, respond with a message to change the job name
      return res
        .status(400)
        .json({
          message: "Job name already exists, please choose a different one",
        });
    } else {
      // Make Axios POST request to Flask route
      const response = await axios.post(`${Flask_URL}/create_job`, data);
      if (response.status === 200) {
        // Create a new Pipeline instance

        data.deploymentLink = "to be generated";
        const pipeline = new Pipeline(data);
        // Save the new pipeline instance to the database
        await pipeline.save();
      }
      // Respond with the response received from Flask
      res.status(200).json({
        message: `Pipeline job '${data.job_name}' created successfully`,
        deploymentLink: "to be generated",
      });
    }
  } catch (error) {
    // If an error occurs during the Axios request, handle it and respond accordingly
    if (error.response) {
      // The request was made and the server responded with a status code outside of 2xx
      res.status(error.response.status).json({ message: error.response.data });
    } else if (error.request) {
      // The request was made but no response was received
      res.status(500).json({ message: "Failed to create Jenkins job" });
    } else {
      // Something happened in setting up the request that triggered an error
      res.status(500).json({ message: "Error making request to server" });
    }
  }
};

const deleteJenkinsJob = async (req, res) => {
  try {
    console.log("received request to delete pipeline");
    const { ProjectId, job_name } = req.query;

    // Check if job_name and ProjectId are provided
    if (!job_name || !ProjectId) {
      return res
        .status(400)
        .json({ error: "job_name and ProjectId are required" });
    }

    const response1 = await axios.post(`${Flask_URL}/build_pipeline`, {
      job_name: job_name,
      param_value: false,
    });

    if (response1.status === 200) {
      // Make a DELETE request to the Flask API
      const response = await axios.delete(`${Flask_URL}/delete_pipeline`, {
        data: { job_name },
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        // Delete the pipeline from the database based on job_name and ProjectId
        const deletedPipeline = await Pipeline.findOneAndDelete({
          job_name,
          ProjectId,
        });
      }

      // Return the response from Flask
      res.status(response.status).json(response.data);
    } else {
      return res.status(400).json({ error: "Failed to stop pipeline" });
    }
  } catch (error) {
    // Handle errors
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

const buildJenkinsJob = async (req, res) => {
  const { job_name } = req.body;

  if (!job_name) {
    return res.status(400).json({ error: "Job name is required" });
  }

  console.log("reached to build pipeline")
  try {
    // Make a POST request to the Flask route
    const response = await axios.post(`${Flask_URL}/build_pipeline`, {
      job_name: job_name,
      param_value: true,
    });

    if (response.status === 200) {
      const pipeline = await Pipeline.findOne({ job_name });
      pipeline.deploymentLink = response.data.deploymentLink;
      await pipeline.save();
    }
    res.status(200).json({
      message: response.data.message,
      deploymentLink: response.data.deploymentLink,
    });
    // // Return the response from Flask
    // return res.status(response.status).json(response.data);
  } catch (error) {
    // If an error occurs, return an error response
    return res.status(500).json({ message: error.message });
  }
};

const getDeploymentLink = async (req, res) => {
  const { ProjectId, Type } = req.body;
  try {
    const pipeline = await Pipeline.findOne({ ProjectId, Type });
    if (!pipeline) {
      return res.status(404).json({ message: "Pipeline not found" });
    }
    res.status(200).json(pipeline);
  } catch (error) {
    console.error("Error retrieving deployment link:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  loginToJenkins,
  createJenkinsJob,
  deleteJenkinsJob,
  buildJenkinsJob,
  getDeploymentLink,
};
