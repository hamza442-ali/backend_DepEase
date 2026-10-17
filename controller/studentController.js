const Student = require('../model/studentModel');
const { asyncHandler, HttpError } = require('../src/http');
exports.getStudent = asyncHandler(async (req, res) => {
  const students = await Student.find({ registration_number: req.params.id });
  if (req.user.role === 'student' && students.some(student => String(student._id) !== req.user.sub)) {
    throw new HttpError(403, 'Insufficient permissions');
  }
  res.json(students);
});
exports.getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw new HttpError(404, 'Student not found');
  if (req.user.role === 'student' && String(student._id) !== req.user.sub) throw new HttpError(403, 'Insufficient permissions');
  res.json(student);
});
exports.getAllStudents = asyncHandler(async (req, res) => res.json(await Student.find()));
exports.createStudent = asyncHandler(async (req, res) => {
  const { student_name, registration_number, email_address, password, phone_number, batch, semester, department } = req.body;
  const student = await Student.create({ student_name, registration_number, email_address, password, phone_number, batch, semester, department });
  res.status(201).json(student);
});
exports.deleteStudentById = asyncHandler(async (req, res) => {
  const result = await Student.deleteOne({ registration_number: req.params.id });
  if (!result.deletedCount) throw new HttpError(404, 'Student not found');
  res.json({ message: 'Student deleted successfully' });
});
