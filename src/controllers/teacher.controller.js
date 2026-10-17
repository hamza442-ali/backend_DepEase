const teachers = require('../services/teacher.service');
const { asyncHandler } = require('../utils/async-handler');

exports.getTeachers = asyncHandler(async (req, res) => {
  res.json({ data: await teachers.listTeachers() });
});
exports.getAllTeachers = asyncHandler(async (req, res) => {
  res.json(await teachers.listTeachers());
});
exports.getTeacherByEmployeeId = asyncHandler(async (req, res) => {
  res.json({ data: await teachers.findByEmployeeId(req.params.registration_number) });
});
exports.getTeacherById = asyncHandler(async (req, res) => {
  res.json(await teachers.findById(req.params.id));
});
exports.createTeacher = asyncHandler(async (req, res) => {
  res.status(201).json(await teachers.createTeacher(req.body));
});
function selectionResponse(result) {
  return {
    message: 'Teachers updated successfully',
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  };
}
exports.selectTeachers = asyncHandler(async (req, res) => {
  res.json(selectionResponse(await teachers.setSelected(req.body, true)));
});
exports.clearTeacherSelection = asyncHandler(async (req, res) => {
  res.json(selectionResponse(await teachers.setSelected(req.body.teachers, false)));
});
exports.deleteTeacherByEmployeeId = asyncHandler(async (req, res) => {
  await teachers.deleteByEmployeeId(req.params.id);
  res.json({ message: 'Teacher deleted successfully' });
});
exports.updateTeacher = asyncHandler(async (req, res) => {
  res.json(await teachers.updateTeacher(req.params.id, req.body));
});
