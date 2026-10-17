// Compatibility names for contributor branch imports.
const controller = require('../src/controllers/project.controller');
module.exports = {
  ...controller,
  getAllProject: controller.listProjects,
  getMineProject: controller.getProjectById,
  getAllMineProject: controller.listProjectsByTeacher,
  getProjectBygroup: controller.listProjectsByGroup,
  updateProjectById: controller.updateProject,
  deleteProjectById: controller.deleteProject,
};
