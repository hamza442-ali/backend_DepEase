const { Router } = require('express');
const {
  loginToJenkins,
  createJenkinsJob,
  buildJenkinsJob,
  deleteJenkinsJob,
  getDeploymentLink,
  connectionStatus,
  listBuilds,
  cancelBuild,
} = require('../controllers/pipeline.controller');

const router = Router();
router.get('/status', connectionStatus);
router.get('/pipelines/:id/builds', listBuilds);
router.post('/pipelines/:id/builds/:buildId/cancel', cancelBuild);

router.post('/login', loginToJenkins);

router.delete('/deletePipline', deleteJenkinsJob);

router.post('/createPipelineJob', createJenkinsJob);

router.post('/buildPipline', buildJenkinsJob);

router.post('/getDeploymentLink', getDeploymentLink);

module.exports = router;
