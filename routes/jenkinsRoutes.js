const express = require('express');
const router = express.Router();
const { loginToJenkins, createJenkinsJob,buildJenkinsJob,deleteJenkinsJob } = require('../controller/jenkinsController');


// Login route
router.post('/login', loginToJenkins);

// delete pipline route
router.post('/deletePipline', deleteJenkinsJob);

// Create Pipeline route
router.post('/createPipelineJob', createJenkinsJob);

// build pipline route
router.post('/buildPipline', buildJenkinsJob);

module.exports = router;