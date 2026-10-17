const Teacher = require('../model/teacherModel');
const { asyncHandler, HttpError } = require('../src/http');
exports.getTeachers = asyncHandler(async (req, res) => res.json({ data: await Teacher.find() }));
exports.getAllTeachers = asyncHandler(async (req, res) => res.json(await Teacher.find()));
exports.getTeacherByRegistrationNumber = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ employeeId: req.params.registration_number });
  if (!teacher) throw new HttpError(404, 'Teacher not found');
  res.json({ data: teacher });
});
exports.getTeacherById = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) throw new HttpError(404, 'Teacher not found');
  res.json(teacher);
});
exports.createTeacher = asyncHandler(async (req, res) => {
  const { name, employeeId, Designation, email, mobile, profilePicture, password } = req.body;
  const teacher = await Teacher.create({ name, employeeId, Designation, email, mobile, profilePicture, passoword: password ?? req.body.passoword });
  res.status(201).json(teacher);
});
function selectTeachers(selected, property) {
  return asyncHandler(async (req, res) => {
    const teachers = property ? req.body[property] : req.body;
    if (!Array.isArray(teachers) || !teachers.length || teachers.length > 500 || teachers.some(teacher => typeof teacher?.employeeId !== 'string' || !teacher.employeeId)) {
      throw new HttpError(400, 'Provide a non-empty list of teacher employee IDs');
    }
    const result = await Teacher.updateMany({ employeeId: { $in: teachers.map(teacher => teacher.employeeId) } }, { $set: { isSelected: selected } });
    res.json({ message: 'Teachers updated successfully', matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
  });
}
exports.updateTeacherIsSelected = selectTeachers(true);
exports.updateIsSelectedFalse = selectTeachers(false, 'teachers');
exports.deleteTeacherById = asyncHandler(async (req, res) => {
  const result = await Teacher.deleteOne({ employeeId: req.params.id });
  if (!result.deletedCount) throw new HttpError(404, 'Teacher not found');
  res.json({ message: 'Teacher deleted successfully' });
});
exports.editTeacherById = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) throw new HttpError(404, 'Teacher not found');
  for (const field of ['name', 'Designation', 'mobile', 'profilePicture']) {
    if (req.body[field] !== undefined) teacher[field] = req.body[field];
  }
  if (req.body.password !== undefined) teacher.passoword = req.body.password;
  await teacher.save();
  res.json(teacher);
});
