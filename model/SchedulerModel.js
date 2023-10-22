const mongoose = require('mongoose');

const schedulerSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
      },
  
    start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  Project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project', // Reference to Project model
    required: true
  },
  type: {
    type: String,
    required: true,
  },
 
});

const Scheduler = mongoose.model('Scheduler', schedulerSchema);

module.exports = Scheduler;
