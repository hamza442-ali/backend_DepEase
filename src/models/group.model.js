const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
  members: { type: [String], default: undefined, index: { unique: true, sparse: true } },
  teamLeadId: {
    type: String,
    required: true,
  },
  teammate1Id: {
    type: String,
    required: true,
  },
  teammate2Id: {
    type: String,
    required: true,
  },
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
