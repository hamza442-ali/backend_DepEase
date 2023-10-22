const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  ProjectId: {
    type: String,
    required: true,
    unique: true
  },
  Batch: {
    type: Number,
    required: true
  },
  proposalSchema: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProposalSchema', // Reference to ProposalSchema model
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher', // Reference to Teacher model
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group', // Reference to Group model
    required: true
  },
  projectProposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProjectProposal', // Reference to ProjectProposal model
    required: true
  },
  
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
