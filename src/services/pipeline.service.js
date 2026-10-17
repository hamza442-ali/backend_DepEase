const Pipeline = require('../models/pipeline.model');
const { jenkinsClient } = require('../integrations/jenkins/client');
const { HttpError } = require('../errors/http-error');
const { jobName, repositoryUrl } = require('../utils/validation');

async function authenticateJenkins() {
  const response = await jenkinsClient().post('/login');
  return { message: response.data.message };
}

async function createPipeline({ repository, projectId, tool, name, type }) {
  const pipeline = new Pipeline({
    git_repo_url: repositoryUrl(repository),
    ProjectId: projectId,
    selectedTool: tool,
    Type: type,
    job_name: jobName(name),
    deploymentLink: 'to be generated',
  });

  await pipeline.validate();
  if (await Pipeline.exists({ job_name: pipeline.job_name })) {
    throw new HttpError(409, 'Job name already exists');
  }

  const client = jenkinsClient();
  await client.post('/create_job', pipeline.toObject());
  try {
    await pipeline.save();
  } catch (error) {
    try {
      await client.delete('/delete_pipeline', { data: { job_name: pipeline.job_name } });
    } catch {
      console.error('Failed to clean up a Jenkins job after a database failure');
    }
    throw error;
  }

  return {
    message: 'Pipeline job created successfully',
    deploymentLink: pipeline.deploymentLink,
  };
}

async function deletePipeline(name, projectId) {
  jobName(name);
  if (typeof projectId !== 'string' || !projectId) {
    throw new HttpError(400, 'ProjectId is required');
  }
  const pipeline = await Pipeline.findOne({ job_name: name, ProjectId: projectId });
  if (!pipeline) throw new HttpError(404, 'Pipeline not found');

  const client = jenkinsClient();
  await client.post('/build_pipeline', { job_name: name, param_value: false });
  const response = await client.delete('/delete_pipeline', { data: { job_name: name } });
  await pipeline.deleteOne();
  return { status: response.status, data: response.data };
}

async function buildPipeline(name) {
  jobName(name);
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
  return { status: response.status, data: response.data };
}

async function getDeploymentLink(projectId, type) {
  if (typeof projectId !== 'string' || typeof type !== 'string') {
    throw new HttpError(400, 'ProjectId and Type are required');
  }
  const pipeline = await Pipeline.findOne({ ProjectId: projectId, Type: type });
  if (!pipeline) throw new HttpError(404, 'Pipeline not found');
  return pipeline;
}

module.exports = {
  authenticateJenkins,
  createPipeline,
  deletePipeline,
  buildPipeline,
  getDeploymentLink,
};
