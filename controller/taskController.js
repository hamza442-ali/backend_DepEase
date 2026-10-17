// Compatibility names for contributor branch imports.
const controller = require('../src/controllers/task.controller');
module.exports = {
  ...controller,
  getbyProjectId: controller.listTasksByProjectId,
};
