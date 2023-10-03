const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
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
  registration_number: {
    type: String,
    required: true,
    unique: true
  },
  isTeamLead: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: true
  }
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
