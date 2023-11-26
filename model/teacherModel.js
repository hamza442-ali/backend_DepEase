const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teacherSchema = new mongoose.Schema({
 teacher_name: {
    type: String,
    required: true
  },
  email_address: {
    type: String,
    required: true,
    unique: true
  },
  phone_number: {
    type: String,
    required: true
  },
  registration_number: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;