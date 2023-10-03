const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const requirementSchema = new mongoose.Schema({

  
  title: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low',
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
  date: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  attachments: {
    type: Array,
    default:"[]"
  },  
  comments:{
        type: [commentSchema],
       
  } ,
  writtenby: {//roll number
    type: String,
    required: true,
  },
  projectid: {// unique project id
    type: String,
    required: true,
  }
});

const Requirement = mongoose.model('Requirement', requirementSchema);

module.exports = Requirement;