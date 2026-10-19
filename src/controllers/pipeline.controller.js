const pipelines = require('../services/pipeline.service');
const { asyncHandler } = require('../utils/async-handler');
const { projectAccess, recordAccess } = require('../services/project-access.service');
const Pipeline = require('../models/pipeline.model');
const { requireRecord } = require('../utils/records');

exports.loginToJenkins = asyncHandler(async (req, res) => {
  res.json(await pipelines.authenticateJenkins());
});

exports.createJenkinsJob = asyncHandler(async (req, res) => {
  await projectAccess(req, req.body.ProjectId, { write: true });
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
  await projectAccess(req, req.query.ProjectId, { write: true });
  const pipeline = requireRecord(
    await Pipeline.findOne({ job_name: req.query.job_name, ProjectId: req.query.ProjectId }),
    'Pipeline',
  );
  await recordAccess(Pipeline, req, pipeline._id, true);
  const { status, data } = await pipelines.deletePipeline(req.query.job_name, req.query.ProjectId);
  res.status(status).json(data);
});

exports.buildJenkinsJob = asyncHandler(async (req, res) => {
  const pipeline = requireRecord(
    await Pipeline.findOne({ job_name: req.body.job_name }),
    'Pipeline',
  );
  await recordAccess(Pipeline, req, pipeline._id, true);
  const { status, data } = await pipelines.buildPipeline(req.body.job_name);
  res.status(status).json(data);
});

exports.getDeploymentLink = asyncHandler(async (req, res) => {
  await projectAccess(req, req.body.ProjectId);
  res.json(await pipelines.getDeploymentLink(req.body.ProjectId, req.body.Type));
});
