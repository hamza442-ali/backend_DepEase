// Compatibility names for contributor branch imports.
const controller = require('../src/controllers/resource-request.controller');
module.exports = {
  ...controller,
  getResourceRequestsbyProjectid: controller.listProjectResourceRequests,
  getResourceRequestsbyTeacherid: controller.listTeacherResourceRequests,
};
