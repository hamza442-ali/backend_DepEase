const panels = require('../services/panel.service');
const { asyncHandler } = require('../utils/async-handler');

exports.createPanel = asyncHandler(async (req, res) => {
  res.status(201).json(await panels.createPanel(req.body));
});
exports.getAllPanels = asyncHandler(async (req, res) => {
  res.json(await panels.listPanels(req.query.id));
});
exports.deletePanel = asyncHandler(async (req, res) => {
  res.json(await panels.deletePanel(req.params.id));
});
exports.assignPanel = asyncHandler(async (req, res) => {
  res.status(201).json(await panels.assignPanel(req.body.studentIds, req.body.panelId));
});
exports.renamePanel = asyncHandler(async (req, res) => {
  res.json(await panels.renamePanel(req.params.id, req.body.newPanelId));
});
