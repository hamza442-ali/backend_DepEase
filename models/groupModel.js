const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
 
  teamLeadId: {
    type: String,
    required: true
  },
  teammate1Id: {
    type: String,
    required: true
  },
  teammate2Id: {
    type: String,
    required: true
  },
  
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;