const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  ProjectId: {
    type: String,
    required: true,
    unique: true
  },
  batch: {
    type: Number,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  teacher: {
    type: String,
    required: true,
  },
  group: {
    type: String,
    required: true,
  },
  projectProposal: {
    type: String,
    required: true,
  },
  
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
