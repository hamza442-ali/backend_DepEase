const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new mongoose.Schema({
  student_name: {
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
  batch: {
    type: Number,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  registration_number: {
    type: String,
    required: true,
    unique: true
  },
  isTeamLead: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true
  },
  department:{

    type: String,
    required: true

  },

  isSelected: {
    type: Boolean,
    default: false,
  },
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;