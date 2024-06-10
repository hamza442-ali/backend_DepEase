const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  employeeId: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  Designation: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: 'default-profile-picture.jpg', 
  },
  passoword:{
    type: String,
    required: true,
  },
  isSelected:{
    type: Boolean,
    default: false,
  },
});

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;