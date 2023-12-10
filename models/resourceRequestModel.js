const mongoose = require('mongoose');

const resourceRequestSchema = new mongoose.Schema({
  
  studentId: {
    type: String,
    required: true
  },
  projectId: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  projectTitle: {
    type: String,
    required: true
  },
  requestType: {
    type: String,
    required: true
  },
  requestReason: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  requestDate: {
    type: Date,
    default: Date.now
},
adminStatus:{
    type: String,
    default: "Pending"
},
supervisorStatus:{
    type: String,
    default: "Pending"
},

rejectionReason_T: {
  type: String,
  default: " "
},
rejectionReason_S: {
  type: String,
  default: " "
},

});

const ResourceRequest = mongoose.model('ResourceRequest', resourceRequestSchema);

module.exports = ResourceRequest;