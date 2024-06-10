const mongoose = require('mongoose');



const assignmentSchema = new mongoose.Schema({
  studentIds: [String], // this basically has projectId of all the students in the panel
  panelId: String, 
});


const Assignment = mongoose.model('AssignmentPanel', assignmentSchema);

module.exports = Assignment;