const { randomUUID } = require('node:crypto');
const mongoose = require('mongoose');
const Build = require('../models/pipeline-build.model');
const Pipeline = require('../models/pipeline.model');
const { jenkinsClient } = require('../integrations/jenkins/client');
const { HttpError } = require('../errors/http-error');
const { requireRecord } = require('../utils/records');

const TERMINAL = new Set(['SUCCESS', 'FAILURE', 'ABORTED', 'UNSTABLE', 'NOT_BUILT']);
const ACTIVE = new Set(['SUBMITTING', 'QUEUED', 'RUNNING', 'UNKNOWN']);
const safeLink = (value) => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password
      ? url.href
      : '';
  } catch {
    return '';
  }
};
const bridgePayload = (pipeline, build) => ({
  job_name: pipeline.job_name,
  request_id: String(build._id),
  queue_id: build.queueId,
  build_number: build.buildNumber,
});

async function applyStatus(pipeline, build, data) {
  if (!TERMINAL.has(data.status) && !ACTIVE.has(data.status))
    throw new Error('Invalid bridge build status');
  const update = {
    status: data.status,
    active: !TERMINAL.has(data.status),
    checkedAt: new Date(),
    message: typeof data.message === 'string' ? data.message.slice(0, 300) : '',
  };
  for (const [key, value] of Object.entries({
    queueId: data.queueId,
    buildNumber: data.buildNumber,
    durationMs: data.durationMs,
  }))
    if (Number.isSafeInteger(value) && value >= 0) update[key] = value;
  if (Number.isFinite(data.startedAt) && data.startedAt > 0)
    update.startedAt = new Date(data.startedAt);
  if (!update.active) update.finishedAt = new Date();
  const link = data.status === 'SUCCESS' ? safeLink(data.deploymentLink) : '';
  if (link) update.deploymentLink = link;
  const saved = await Build.findOneAndUpdate(
    { _id: build._id, active: true },
    { $set: update },
    { returnDocument: 'after', runValidators: true },
  );
  if (saved && link)
    await Pipeline.updateOne({ _id: pipeline._id }, { $set: { deploymentLink: link } });
  return saved || Build.findById(build._id);
}

async function startBuild(pipeline, requestId = randomUUID()) {
  if (typeof requestId !== 'string' || !/^[A-Za-z0-9-]{16,80}$/.test(requestId))
    throw new HttpError(400, 'A stable build request ID is required');
  const client = jenkinsClient();
  const reserved = await mongoose.connection.transaction(async (session) => {
    const current = await Pipeline.findOneAndUpdate(
      { _id: pipeline._id, $or: [{ state: 'READY' }, { state: { $exists: false } }] },
      { $inc: { revision: 1 } },
      { session, returnDocument: 'after' },
    );
    if (!current)
      throw new HttpError(409, 'Pipeline setup or removal is in progress. Refresh its status.');
    const previous = await Build.findOne({ pipelineId: current._id, requestId }).session(session);
    if (previous) return { build: previous, created: false };
    const active = await Build.findOne({ pipelineId: current._id, active: true }).session(session);
    if (active) return { build: active, created: false };
    const [build] = await Build.create(
      [{ pipelineId: current._id, ProjectId: current.ProjectId, requestId }],
      { session },
    );
    return { build, created: true };
  });
  if (!reserved.created) return reserved.build;
  try {
    const response = await client.post('/start_build', bridgePayload(pipeline, reserved.build));
    return await applyStatus(pipeline, reserved.build, response.data);
  } catch (error) {
    const rejected =
      ['ECONNREFUSED', 'ENOTFOUND'].includes(error.code) ||
      [400, 401, 403, 404, 409, 503].includes(error.response?.status);
    return applyStatus(pipeline, reserved.build, {
      status: rejected ? 'FAILURE' : 'UNKNOWN',
      message: rejected
        ? 'Jenkins did not accept this build. Check the connection and retry.'
        : 'The build request could not be confirmed. Refresh status before starting another build.',
    });
  }
}

async function refreshBuild(pipeline, build) {
  if (!build.active) return build;
  if (build.status === 'SUBMITTING' && Date.now() - build.createdAt.getTime() < 45000) return build;
  const lease = await Build.findOneAndUpdate(
    {
      _id: build._id,
      active: true,
      $or: [{ checkedAt: { $lt: new Date(Date.now() - 2500) } }, { checkedAt: { $exists: false } }],
    },
    { $set: { checkedAt: new Date() } },
    { returnDocument: 'after' },
  );
  if (!lease) return Build.findById(build._id);
  try {
    const response = await jenkinsClient().post('/build_status', bridgePayload(pipeline, lease));
    return await applyStatus(pipeline, lease, response.data);
  } catch {
    await Build.updateOne(
      { _id: lease._id, active: true },
      {
        $set: {
          message:
            'Status is temporarily unavailable. Your build is retained; refresh to reconnect.',
        },
      },
    );
    return Build.findById(lease._id);
  }
}

async function listBuilds(pipeline) {
  const active = await Build.findOne({ pipelineId: pipeline._id, active: true });
  if (active) await refreshBuild(pipeline, active);
  return Build.find({ pipelineId: pipeline._id }).sort({ createdAt: -1 }).limit(20);
}

async function cancelBuild(pipeline, id) {
  const build = requireRecord(await Build.findOne({ _id: id, pipelineId: pipeline._id }), 'Build');
  if (!build.active) return build;
  if (build.status === 'SUBMITTING' && Date.now() - build.createdAt.getTime() < 45000)
    throw new HttpError(
      409,
      'The build is still being submitted. Wait for a queue identifier before cancelling.',
    );
  const response = await jenkinsClient().post('/cancel_build', bridgePayload(pipeline, build));
  await applyStatus(pipeline, build, response.data);
  await Build.updateOne(
    { _id: build._id },
    {
      $set: {
        cancelRequested: response.data.cancelRequested === true,
        ...(response.data.cancelRequested && {
          message: 'Cancellation requested; waiting for Jenkins to confirm.',
        }),
      },
    },
  );
  return Build.findById(build._id);
}

module.exports = { startBuild, listBuilds, cancelBuild, refreshBuild };
