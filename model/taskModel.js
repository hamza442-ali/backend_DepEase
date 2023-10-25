const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  
  summary: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  assignee: {
    type: String,
    required: true,
  },
  reporter: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    required: true,
  },
  projectid: {
    type: String,
    required: true,
  }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
