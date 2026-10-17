const { Router } = require('express');
const router = Router();
const {
  loginToJenkins,
  createJenkinsJob,
  buildJenkinsJob,
  deleteJenkinsJob,
  getDeploymentLink,
} = require('../controllers/pipeline.controller');

router.post('/login', loginToJenkins);

router.delete('/deletePipline', deleteJenkinsJob);

router.post('/createPipelineJob', createJenkinsJob);

router.post('/buildPipline', buildJenkinsJob);

router.post('/getDeploymentLink', getDeploymentLink);

module.exports = router;
