// Compatibility names for contributor branch imports.
const controller = require('../src/controllers/project-module.controller');
module.exports = {
  ...controller,
  getModuleById: controller.listProjectModules,
};
