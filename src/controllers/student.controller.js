const students = require('../services/student.service');
const { asyncHandler } = require('../utils/async-handler');

exports.listStudentsByRegistrationNumber = asyncHandler(async (req, res) => {
  res.json(await students.findByRegistrationNumber(req.params.id, req.user));
});
exports.getStudentById = asyncHandler(async (req, res) => {
  res.json(await students.findById(req.params.id, req.user));
});
exports.getAllStudents = asyncHandler(async (req, res) => {
  res.json(await students.listStudents());
});
exports.createStudent = asyncHandler(async (req, res) => {
  res.status(201).json(await students.createStudent(req.body));
});
exports.deleteStudentByRegistrationNumber = asyncHandler(async (req, res) => {
  await students.deleteByRegistrationNumber(req.params.id);
  res.json({ message: 'Student deleted successfully' });
});
