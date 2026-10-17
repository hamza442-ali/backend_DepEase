const pipelines = require('../services/pipeline.service');
const { asyncHandler } = require('../utils/async-handler');

exports.loginToJenkins = asyncHandler(async (req, res) => {
  res.json(await pipelines.authenticateJenkins());
});

exports.createJenkinsJob = asyncHandler(async (req, res) => {
  const result = await pipelines.createPipeline({
    repository: req.body.githubLink,
    projectId: req.body.ProjectId,
    tool: req.body.selectedTool,
    name: req.body.jobname,
    type: req.body.Type,
  });
  res.json(result);
});

exports.deleteJenkinsJob = asyncHandler(async (req, res) => {
  const { status, data } = await pipelines.deletePipeline(req.query.job_name, req.query.ProjectId);
  res.status(status).json(data);
});

exports.buildJenkinsJob = asyncHandler(async (req, res) => {
  const { status, data } = await pipelines.buildPipeline(req.body.job_name);
  res.status(status).json(data);
});

exports.getDeploymentLink = asyncHandler(async (req, res) => {
  res.json(await pipelines.getDeploymentLink(req.body.ProjectId, req.body.Type));
});
