const express = require('express');
const router = express.Router();
const { loginToJenkins, createJenkinsJob, checkJob } = require('../controller/jenkinsController');


// Login route
router.post('/login', loginToJenkins);

// Create pipeline job route
router.post('/checkJobs', checkJob);

// Trigger build route
router.post('/createPipelineJob', createJenkinsJob);



module.exports = router;