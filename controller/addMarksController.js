// Compatibility names for contributor branch imports.
const controller = require('../src/controllers/evaluation-marks.controller');
module.exports = {
  ...controller,
  createAddMarks: controller.createMarks,
  getAllAddMarks: controller.listMarks,
  getAddMarksByProjectId: controller.listProjectMarks,
  updateAddMarks: controller.updateProjectMarks,
  deleteAddMarks: controller.deleteMarks,
};
