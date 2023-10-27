const Student = require('../model/studentModel');

// Create a new student
exports.createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) throw new Error('Student not found');
    res.status(200).json(student);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// Update a student by ID
exports.updateStudentById = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!student) throw new Error('Student not found');
    res.status(200).json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a student by ID
exports.deleteStudentById = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) throw new Error('Student not found');
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};




// Student login
exports.studentLogin = async (req, res) => {
  const { email_address, password } = req.body;
  try {
    const student = await Student.findOne({ email_address, password });
    if (!student) throw new Error('Invalid email or password');
    res.status(200).json(student);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};
