const Panel = require('../models/panel.model');
const PanelAssignment = require('../models/panel-assignment.model');
const { HttpError } = require('../errors/http-error');
const { requireRecord, requireDeletion } = require('../utils/records');

async function createPanel({ id, teachers }) {
  if (typeof id !== 'string' || !id.trim()) throw new HttpError(400, 'Panel ID is required');
  return Panel.create({ id, teachers });
}

function listPanels(id) {
  return Panel.find(id ? { id } : {});
}

async function deletePanel(id) {
  return requireDeletion(await Panel.deleteOne({ id }), 'Panel');
}

async function assignPanel(studentIds, panelId) {
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
  return PanelAssignment.create({ studentIds: [...new Set(studentIds)], panelId });
}

async function renamePanel(id, newPanelId) {
  if (typeof newPanelId !== 'string' || !newPanelId.trim()) {
    throw new HttpError(400, 'New panel ID is required');
  }
  const panel = requireRecord(
    await Panel.findOneAndUpdate(
      { id },
      { $set: { id: newPanelId } },
      { new: true, runValidators: true },
    ),
    'Panel',
  );
  await PanelAssignment.updateMany({ panelId: id }, { $set: { panelId: newPanelId } });
  return panel;
}

module.exports = { createPanel, listPanels, deletePanel, assignPanel, renamePanel };
