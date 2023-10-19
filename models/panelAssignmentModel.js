const mongoose = require('mongoose');



const assignmentSchema = new mongoose.Schema({
  studentIds: [String], 
  panelId: String, 
});


const Assignment = mongoose.model('AssignmentPanel', assignmentSchema);

module.exports = Assignment;
