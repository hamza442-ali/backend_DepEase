const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    pipelineId: { type: mongoose.Schema.Types.ObjectId, required: true, immutable: true },
    ProjectId: { type: String, required: true, immutable: true },
    requestId: { type: String, required: true, immutable: true },
    status: {
      type: String,
      enum: [
        'SUBMITTING',
        'QUEUED',
        'RUNNING',
        'SUCCESS',
        'FAILURE',
        'ABORTED',
        'UNSTABLE',
        'NOT_BUILT',
        'UNKNOWN',
      ],
      default: 'SUBMITTING',
    },
    active: { type: Boolean, default: true },
    queueId: Number,
    buildNumber: Number,
    durationMs: Number,
    startedAt: Date,
    finishedAt: Date,
    checkedAt: Date,
    deploymentLink: String,
    message: String,
    cancelRequested: { type: Boolean, default: false },
  },
  { timestamps: true },
);
schema.index({ pipelineId: 1, requestId: 1 }, { unique: true });
schema.index({ pipelineId: 1 }, { unique: true, partialFilterExpression: { active: true } });
schema.index({ pipelineId: 1, createdAt: -1 });
module.exports = mongoose.model('PipelineBuild', schema);
