const Student = require('../../models/student.model');
const Teacher = require('../../models/teacher.model');
const { ROLES } = require('../../constants/roles');

const accountTypes = Object.freeze({
  [ROLES.STUDENT]: Object.freeze({
    model: Student,
    emailField: 'email_address',
    passwordField: 'password',
  }),
  [ROLES.TEACHER]: Object.freeze({
    model: Teacher,
    emailField: 'email',
    passwordField: 'passoword',
  }),
});

function getAccountType(type) {
  if (!Object.hasOwn(accountTypes, type)) throw new Error('Specify student or teacher');
  return accountTypes[type];
}

module.exports = { getAccountType };
