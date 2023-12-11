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
  education: {
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
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female'], 
  },
  profilePicture: {
    type: String,
    default: 'default-profile-picture.jpg', 
  },
  passoword:{
    type: String,
    required: true,
  }
});

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;