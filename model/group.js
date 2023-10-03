const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
  groupName: {
    type: String,
    required: true,
  },
  teamLead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }],
  projectProposal: {
    type: String,
    required: true,
  },
  // Other group-related fields
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
