// Compatibility names for contributor branch imports.
const controller = require('../src/controllers/student.controller');
module.exports = {
  ...controller,
  getStudent: controller.listStudentsByRegistrationNumber,
  deleteStudentById: controller.deleteStudentByRegistrationNumber,
};
