const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pipelineSchema = new Schema({
 
    git_repo_url: {
    type: String,
    required: true
  },
  ProjectId: {
    type: String,
    required: true
  },
  selectedTool: {
    type: String,
    required: true
  },
  deploymentLink: {
    type: String,
  },
  job_name: { 
    type: String,
    required: true
  },
  Type: { 
    type: String,
    required: true
  },
  
});

const Pipeline = mongoose.model('Pipeline', pipelineSchema);

module.exports = Pipeline;






