const Panel = require('../models/panel.model');
const { createCrudHandlers } = require('./crud-handlers');
const { asyncHandler } = require('../utils/async-handler');
const { HttpError } = require('../errors/http-error');
const handlers = createCrudHandlers(Panel, 'Panel');

const Assignment = require('../models/panel-assignment.model');
exports.createPanel = handlers.create((req) => {
  if (typeof req.body.id !== 'string' || !req.body.id.trim())
    throw new HttpError(400, 'Panel ID is required');
  return { id: req.body.id, teachers: req.body.teachers };
});
exports.getAllPanels = handlers.list((req) => {
  const id = req.query.id;
  return id ? { id } : {};
});
exports.deletePanelByID = asyncHandler(async (req, res) => {
  // The route parameter is the exact business panel ID; never fall back to an empty filter.
  const result = await Panel.deleteOne({ id: req.params.id });
  if (!result.deletedCount) throw new HttpError(404, 'Panel not found');
  res.json(result);
});
exports.AssignPanel = asyncHandler(async (req, res) => {
  const { studentIds, panelId } = req.body;
  if (
    !Array.isArray(studentIds) ||
    !studentIds.length ||
    studentIds.some((id) => typeof id !== 'string' || !id) ||
    typeof panelId !== 'string' ||
    !panelId
  ) {
    throw new HttpError(400, 'Student IDs and panel ID are required');
  }
  if (!(await Panel.exists({ id: panelId }))) throw new HttpError(404, 'Panel not found');
  res.status(201).json(await Assignment.create({ studentIds: [...new Set(studentIds)], panelId }));
});
exports.editPanelIdByid = asyncHandler(async (req, res) => {
  const { newPanelId } = req.body;
  if (typeof newPanelId !== 'string' || !newPanelId.trim())
    throw new HttpError(400, 'New panel ID is required');
  const panel = handlers.requireRecord(
    await Panel.findOneAndUpdate(
      { id: req.params.id },
      { $set: { id: newPanelId } },
      { new: true, runValidators: true },
    ),
  );
  await Assignment.updateMany({ panelId: req.params.id }, { $set: { panelId: newPanelId } });
  res.json(panel);
});
