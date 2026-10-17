// Compatibility names for contributor branch imports.
const controller = require('../src/controllers/deliverable.controller');
module.exports = {
  ...controller,
  getDeliverableById: controller.listProjectDeliverables,
};
