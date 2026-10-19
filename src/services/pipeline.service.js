const mongoose = require('mongoose');
const Pipeline = require('../models/pipeline.model');
const Build = require('../models/pipeline-build.model');
const { jenkinsClient } = require('../integrations/jenkins/client');
const { HttpError } = require('../errors/http-error');
const { jobName, repositoryUrl } = require('../utils/validation');
const { requireRecord } = require('../utils/records');

const TOOLS = { Frontend: ['ReactJs'], Backend: ['Node/Express js', 'Flask'] };

function scmOptions(branch = 'main', scriptPath = 'Jenkinsfile') {
  if (
    typeof branch !== 'string' ||
    !/^[A-Za-z0-9_./-]{1,160}$/.test(branch) ||
    branch.includes('..') ||
    branch.includes('//') ||
    /^[-/.]/.test(branch) ||
    /(?:\/|\.|\.lock)$/.test(branch)
  )
    throw new HttpError(400, 'Use a valid Git branch name');
  if (
    typeof scriptPath !== 'string' ||
    !/^[A-Za-z0-9_./-]{1,200}$/.test(scriptPath) ||
    scriptPath.startsWith('/') ||
    scriptPath.split('/').some((part) => ['', '.', '..'].includes(part))
  )
    throw new HttpError(400, 'Use a repository-relative Jenkinsfile path');
  return { branch, scriptPath };
}

function publicUrl(name) {
  try {
    const url = new URL(process.env.JENKINS_PUBLIC_URL);
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      return undefined;
    return `${url.href.replace(/\/$/, '')}/job/${encodeURIComponent(name)}/`;
  } catch {
    return undefined;
  }
}

async function connectionStatus() {
  let client;
  try {
    client = jenkinsClient();
  } catch {
    return {
      configured: false,
      connected: false,
      message: 'Start the local stack with -WithJenkins to connect Jenkins.',
    };
  }
  try {
    return { configured: true, ...(await client.get('/connection', { timeout: 25000 })).data };
  } catch {
    return {
      configured: true,
      connected: false,
      message:
        'Jenkins is unavailable. Check that the controller, bridge and credentials are ready; saved build history is retained.',
    };
  }
}

async function authenticateJenkins() {
  const result = await connectionStatus();
  if (!result.connected) throw new HttpError(503, result.message);
  return { ...result, message: 'Jenkins connected successfully' };
}

async function createPipeline({ repository, projectId, tool, name, type, branch, scriptPath }) {
  if (!TOOLS[type]?.includes(tool))
    throw new HttpError(400, 'Choose a supported application and build tool');
  const input = {
    git_repo_url: repositoryUrl(repository),
    ProjectId: projectId,
    selectedTool: tool,
    Type: type,
    job_name: jobName(name),
    ...scmOptions(branch, scriptPath),
  };
  const client = jenkinsClient();
  let pipeline = await Pipeline.findOne({ ProjectId: projectId, Type: type });
  if (pipeline) {
    if (Object.entries(input).some(([key, value]) => pipeline[key] !== value))
      throw new HttpError(
        409,
        'This application already has a pipeline. Remove it before changing its configuration.',
      );
    if (pipeline.state === 'READY')
      return { ...pipeline.toObject(), message: 'Pipeline is already connected' };
    if (pipeline.state === 'DELETING') throw new HttpError(409, 'Pipeline removal is in progress');
    const claimed = await Pipeline.findOneAndUpdate(
      {
        _id: pipeline._id,
        $or: [
          { state: 'ERROR' },
          { state: 'CREATING', provisionStartedAt: { $lt: new Date(Date.now() - 45000) } },
          { state: 'CREATING', provisionStartedAt: { $exists: false } },
        ],
      },
      { $set: { state: 'CREATING', provisionStartedAt: new Date() } },
      { returnDocument: 'after' },
    );
    if (!claimed)
      return {
        ...pipeline.toObject(),
        message: 'Pipeline setup is in progress. Refresh its status shortly.',
      };
    pipeline = claimed;
  } else {
    pipeline = await Pipeline.create({
      ...input,
      state: 'CREATING',
      managedOwner: true,
      provisionStartedAt: new Date(),
    });
  }
  try {
    await client.post('/create_job', { ...input, owner_id: String(pipeline._id) });
    await Pipeline.updateOne(
      { _id: pipeline._id, state: { $ne: 'DELETING' } },
      { $set: { state: 'READY', lastError: '' } },
    );
    return {
      ...(await Pipeline.findById(pipeline._id)).toObject(),
      message: 'Pipeline connected. You can now run its first build.',
    };
  } catch {
    await Pipeline.updateOne(
      { _id: pipeline._id, state: { $ne: 'DELETING' } },
      {
        $set: {
          state: 'ERROR',
          lastError:
            'Jenkins setup could not be confirmed. Check the connection, then retry setup.',
        },
      },
    );
    return {
      ...(await Pipeline.findById(pipeline._id)).toObject(),
      message: 'Pipeline configuration saved. Jenkins setup needs attention.',
    };
  }
}

async function deletePipeline(name, projectId) {
  jobName(name);
  const client = jenkinsClient();
  const pipeline = await mongoose.connection.transaction(async (session) => {
    const record = requireRecord(
      await Pipeline.findOneAndUpdate(
        { job_name: name, ProjectId: projectId, state: { $ne: 'CREATING' } },
        { $set: { state: 'DELETING' }, $inc: { revision: 1 } },
        { session, returnDocument: 'after' },
      ),
      'Pipeline',
    );
    if (await Build.exists({ pipelineId: record._id, active: true }).session(session))
      throw new HttpError(409, 'Cancel or finish the active build before removing this pipeline');
    return record;
  });
  const response = await client.delete('/delete_pipeline', {
    data: { job_name: name, ...(pipeline.managedOwner && { owner_id: String(pipeline._id) }) },
  });
  await mongoose.connection.transaction(async (session) => {
    await Build.deleteMany({ pipelineId: pipeline._id }, { session });
    await Pipeline.deleteOne({ _id: pipeline._id }, { session });
  });
  return { status: 200, data: response.data };
}

async function getDeploymentLink(projectId, type) {
  if (typeof projectId !== 'string' || !TOOLS[type])
    throw new HttpError(400, 'ProjectId and application type are required');
  const pipeline = requireRecord(
    await Pipeline.findOne({ ProjectId: projectId, Type: type }),
    'Pipeline',
  );
  const builds = await require('./pipeline-build.service').listBuilds(pipeline);
  const latest = requireRecord(await Pipeline.findById(pipeline._id), 'Pipeline');
  return { ...latest.toObject(), jobUrl: publicUrl(latest.job_name), builds };
}

module.exports = {
  authenticateJenkins,
  connectionStatus,
  createPipeline,
  deletePipeline,
  getDeploymentLink,
  scmOptions,
  publicUrl,
};
