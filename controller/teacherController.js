// controllers/teacherController.js
const Teacher = require('../model/teacherModel');



// Get all teachers
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.status(200).json({ data: teachers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a teacher by registration number
exports.getTeacherByRegistrationNumber = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ registration_number: req.params.registration_number });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.status(200).json({ data: teacher });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

