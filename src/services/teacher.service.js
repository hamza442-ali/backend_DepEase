const Teacher = require('../models/teacher.model');
const { HttpError } = require('../errors/http-error');
const {
  requireRecord,
  requireDeletion,
  pickFields,
  assignDefinedFields,
} = require('../utils/records');

const PROFILE_FIELDS = ['name', 'employeeId', 'Designation', 'email', 'mobile', 'profilePicture'];
const EDITABLE_FIELDS = ['name', 'Designation', 'mobile', 'profilePicture'];

function listTeachers() {
  return Teacher.find();
}

async function findByEmployeeId(employeeId) {
  return requireRecord(await Teacher.findOne({ employeeId }), 'Teacher');
}

async function findById(id) {
  return requireRecord(await Teacher.findById(id), 'Teacher');
}

function createTeacher(input) {
  return Teacher.create({
    ...pickFields(input, PROFILE_FIELDS),
    passoword: input.password ?? input.passoword,
  });
}

async function setSelected(teachers, selected) {
  if (
    !Array.isArray(teachers) ||
    !teachers.length ||
    teachers.length > 500 ||
    teachers.some((teacher) => typeof teacher?.employeeId !== 'string' || !teacher.employeeId)
  ) {
    throw new HttpError(400, 'Provide a non-empty list of teacher employee IDs');
  }
  const employeeIds = teachers.map((teacher) => teacher.employeeId);
  return Teacher.updateMany(
    { employeeId: { $in: employeeIds } },
    { $set: { isSelected: selected } },
  );
}

async function deleteByEmployeeId(employeeId) {
  requireDeletion(await Teacher.deleteOne({ employeeId }), 'Teacher');
}

async function updateTeacher(id, input) {
  const teacher = await findById(id);
  assignDefinedFields(teacher, input, EDITABLE_FIELDS);
  if (input.password !== undefined) teacher.passoword = input.password;
  return teacher.save();
}

module.exports = {
  listTeachers,
  findByEmployeeId,
  findById,
  createTeacher,
  setSelected,
  deleteByEmployeeId,
  updateTeacher,
};
