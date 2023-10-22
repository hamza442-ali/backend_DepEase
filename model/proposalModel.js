const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  projectTitle: {
    type: String,
    required: true
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher', // Reference to Teacher model
    required: true
  },
  problemStatement: {
    type: String,
    required: true
  },
  problemSolution: {
    type: String,
    required: true
  },
  scope: {
    type: String,
    required: true
  },
  timeline: [{
    type: String,
    required: true
  }],
  technologyUsed: {
    type: String,
    required: true
  },
  modules: [{
    type: String,
    required: true
  }]
});

const Proposal = mongoose.model('Proposal', proposalSchema);

module.exports = Proposal;
