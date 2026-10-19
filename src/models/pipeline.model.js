const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pipelineSchema = new Schema({
  state: { type: String, enum: ['CREATING', 'READY', 'ERROR', 'DELETING'], default: 'READY' },
  branch: { type: String, default: 'main' },
  scriptPath: { type: String, default: 'Jenkinsfile' },
  revision: { type: Number, default: 0 },
  lastError: String,
  provisionStartedAt: Date,
  managedOwner: { type: Boolean, default: false },
  git_repo_url: {
    type: String,
    required: true,
  },
  ProjectId: {
    type: String,
    required: true,
  },
  selectedTool: {
    type: String,
    required: true,
  },
  deploymentLink: {
    type: String,
  },
  job_name: {
    type: String,
    required: true,
  },
  Type: {
    type: String,
    required: true,
  },
});
pipelineSchema.index({ job_name: 1 }, { unique: true });
pipelineSchema.index({ ProjectId: 1, Type: 1 }, { unique: true });

const Pipeline = mongoose.model('Pipeline', pipelineSchema);

module.exports = Pipeline;
