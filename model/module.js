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
  status: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Replace 'User' with the actual user model name if needed
  },
  details: {
    type: String,
    required: true,
  },
});

const Module = mongoose.model('Module', moduleSchema);

module.exports = Module;
