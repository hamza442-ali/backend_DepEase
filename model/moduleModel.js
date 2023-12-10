const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const moduleSchema = new Schema({
  
  projectId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending',
  },
  details: {
    type: String,
    required: true,
  },
});

const Module = mongoose.model('Module', moduleSchema);

module.exports = Module;
