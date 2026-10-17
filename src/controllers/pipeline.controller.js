const Pipeline = require('../models/pipeline.model');
const { asyncHandler } = require('../utils/async-handler');
const { HttpError } = require('../errors/http-error');
const { jobName } = require('../utils/validation');
const { jenkinsClient } = require('../integrations/jenkins/client');
exports.loginToJenkins = asyncHandler(async (req, res) => {
  const response = await jenkinsClient().post('/login');
  res.json({ message: response.data.message });
});
exports.createJenkinsJob = asyncHandler(async (req, res) => {
  const { githubLink, ProjectId, selectedTool, Type } = req.body;
  const name = jobName(req.body.jobname);
  let repo;
  try {
    repo = new URL(githubLink);
  } catch {
    throw new HttpError(400, 'A valid HTTPS repository URL is required');
  }
  if (
    repo.protocol !== 'https:' ||
    !['github.com', 'gitlab.com', 'bitbucket.org'].includes(repo.hostname) ||
    repo.username ||
    repo.password ||
    repo.port ||
    repo.search ||
    repo.hash ||
    repo.pathname.split('/').filter(Boolean).length < 2
  ) {
    throw new HttpError(400, 'Use an HTTPS GitHub, GitLab or Bitbucket repository URL');
  }
  const pipeline = new Pipeline({
    git_repo_url: repo.href,
    ProjectId,
    selectedTool,
    Type,
    job_name: name,
    deploymentLink: 'to be generated',
  });
  await pipeline.validate();
  if (await Pipeline.exists({ job_name: name }))
    throw new HttpError(409, 'Job name already exists');
  await jenkinsClient().post('/create_job', pipeline.toObject());
  try {
    await pipeline.save();
  } catch (error) {
    try {
      await jenkinsClient().delete('/delete_pipeline', { data: { job_name: name } });
    } catch {
      console.error('Failed to clean up a Jenkins job after a database failure');
    }
    throw error;
  }
  res.json({
    message: 'Pipeline job created successfully',
    deploymentLink: pipeline.deploymentLink,
  });
});
exports.deleteJenkinsJob = asyncHandler(async (req, res) => {
  const name = jobName(req.query.job_name);
  if (typeof req.query.ProjectId !== 'string' || !req.query.ProjectId)
    throw new HttpError(400, 'ProjectId is required');
  const pipeline = await Pipeline.findOne({ job_name: name, ProjectId: req.query.ProjectId });
  if (!pipeline) throw new HttpError(404, 'Pipeline not found');
  const client = jenkinsClient();
  await client.post('/build_pipeline', { job_name: name, param_value: false });
  const response = await client.delete('/delete_pipeline', { data: { job_name: name } });
  await pipeline.deleteOne();
  res.status(response.status).json(response.data);
});
exports.buildJenkinsJob = asyncHandler(async (req, res) => {
  const name = jobName(req.body.job_name);
  const pipeline = await Pipeline.findOne({ job_name: name });
  if (!pipeline) throw new HttpError(404, 'Pipeline not found');
  const response = await jenkinsClient().post('/build_pipeline', {
    job_name: name,
    param_value: true,
  });
  if (typeof response.data.deploymentLink === 'string' && response.data.deploymentLink) {
    pipeline.deploymentLink = response.data.deploymentLink;
    await pipeline.save();
  }
  res.status(response.status).json(response.data);
});
exports.getDeploymentLink = asyncHandler(async (req, res) => {
  const { ProjectId, Type } = req.body;
  if (typeof ProjectId !== 'string' || typeof Type !== 'string')
    throw new HttpError(400, 'ProjectId and Type are required');
  const pipeline = await Pipeline.findOne({ ProjectId, Type });
  if (!pipeline) throw new HttpError(404, 'Pipeline not found');
  res.json(pipeline);
});
