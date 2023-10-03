// Import Mongoose
const mongoose = require('mongoose');

// Define the Student schema
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
  registration_number: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  password: {
    type: String,
    required: true
  }
});

// Create and export the Student model
module.exports = mongoose.model('Student', studentSchema);
