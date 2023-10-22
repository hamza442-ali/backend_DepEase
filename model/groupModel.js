const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
  groupId: {
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
  
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;







