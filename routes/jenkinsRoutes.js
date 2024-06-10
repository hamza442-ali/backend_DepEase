const express = require('express');
const router = express.Router();
const { loginToJenkins, createJenkinsJob,buildJenkinsJob,deleteJenkinsJob,getDeploymentLink } = require('../controller/jenkinsController');


// Login route
router.post('/login', loginToJenkins);

// delete pipline route
router.delete('/deletePipline', deleteJenkinsJob);

// Create Pipeline route
router.post('/createPipelineJob', createJenkinsJob);

// build pipline route
router.post('/buildPipline', buildJenkinsJob);

router.post('/getDeploymentLink', getDeploymentLink);

module.exports = router;