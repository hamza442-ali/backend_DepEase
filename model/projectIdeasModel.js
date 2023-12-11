const mongoose = require('mongoose');

const projectIdeaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  teacherName: {
    type: String,
    required: true,
  },
});

const ProjectIdea = mongoose.model('ProjectIdea', projectIdeaSchema);

module.exports = ProjectIdea;
