const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const moduleSchema = new Schema({
  moduleId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  assignedTo: {
    type: Array,
    default:"[]"
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
