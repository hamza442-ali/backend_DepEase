// Compatibility names for contributor branch imports.
const controller = require('../src/controllers/panel.controller');
module.exports = {
  ...controller,
  AssignPanel: controller.assignPanel,
  editPanelIdByid: controller.renamePanel,
  deletePanelByID: controller.deletePanel,
};
