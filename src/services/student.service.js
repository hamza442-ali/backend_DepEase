const Student = require('../models/student.model');
const { ROLES } = require('../constants/roles');
const { HttpError } = require('../errors/http-error');
const { requireRecord, requireDeletion, pickFields } = require('../utils/records');

const STUDENT_FIELDS = [
  'student_name',
  'registration_number',
  'email_address',
  'password',
  'phone_number',
  'batch',
  'semester',
  'department',
];

function requireProfileAccess(actor, student) {
  if (actor.role === ROLES.STUDENT && String(student._id) !== actor.sub) {
    throw new HttpError(403, 'Insufficient permissions');
  }
}

async function findByRegistrationNumber(registrationNumber, actor) {
  const students = await Student.find({ registration_number: registrationNumber });
  for (const student of students) requireProfileAccess(actor, student);
  return students;
}

async function findById(id, actor) {
  const student = requireRecord(await Student.findById(id), 'Student');
  requireProfileAccess(actor, student);
  return student;
}

function listStudents() {
  return Student.find();
}

function createStudent(input) {
  return Student.create(pickFields(input, STUDENT_FIELDS));
}

async function deleteByRegistrationNumber(registrationNumber) {
  const result = await Student.deleteOne({ registration_number: registrationNumber });
  requireDeletion(result, 'Student');
}

module.exports = {
  findByRegistrationNumber,
  findById,
  listStudents,
  createStudent,
  deleteByRegistrationNumber,
};
