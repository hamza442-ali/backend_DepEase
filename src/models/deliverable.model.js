const { WORKFLOW_STATUSES } = require('../constants/workflow');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deliverableSchema = new Schema({
  projectId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: WORKFLOW_STATUSES,
    default: 'Pending',
  },
  deadline: {
    type: Date,
    required: true,
  },
  modules: {
    type: Array,
  },
});

const Deliverable = mongoose.model('Deliverable', deliverableSchema);

module.exports = Deliverable;
