const mongoose = require('mongoose');

const projectIdeaSchema = new mongoose.Schema({
  ProjectIdeaId: {
    type: String,
    required: true,
    unique: true,
  },
  IdeaTitle: {
    type: String,
    required: true,
  },
  Description: {
    type: String,
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher', // Reference to Teacher model
    required: true,
  },
});

const ProjectIdea = mongoose.model('ProjectIdea', projectIdeaSchema);

module.exports = ProjectIdea;
