// Compatibility names for contributor branch imports.
const controller = require('../src/controllers/teacher.controller');
module.exports = {
  ...controller,
  getTeacherByRegistrationNumber: controller.getTeacherByEmployeeId,
  updateTeacherIsSelected: controller.selectTeachers,
  updateIsSelectedFalse: controller.clearTeacherSelection,
  deleteTeacherById: controller.deleteTeacherByEmployeeId,
  editTeacherById: controller.updateTeacher,
};
