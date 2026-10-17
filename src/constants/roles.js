const ROLES = Object.freeze({
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
});

const STAFF_ROLES = Object.freeze([ROLES.TEACHER, ROLES.ADMIN]);

module.exports = { ROLES, STAFF_ROLES };
