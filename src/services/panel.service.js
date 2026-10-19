const Panel = require('../models/panel.model');
const PanelAssignment = require('../models/panel-assignment.model');
const { HttpError } = require('../errors/http-error');
const { requireRecord } = require('../utils/records');
const mongoose = require('mongoose');
const Teacher = require('../models/teacher.model');
const Project = require('../models/project.model');

async function createPanel({ id, teachers }) {
  if (typeof id !== 'string' || !id.trim()) throw new HttpError(400, 'Panel ID is required');
  if (
    !Array.isArray(teachers) ||
    !teachers.length ||
    teachers.filter((teacher) => teacher.panelHead === true).length !== 1
  )
    throw new HttpError(400, 'Choose panel members and exactly one panel head');
  const ids = teachers.map((teacher) => teacher.employeeId);
  if (new Set(ids).size !== ids.length)
    throw new HttpError(400, 'Panel members must be different teachers');
  const accounts = await Teacher.find({ employeeId: { $in: ids } });
  if (accounts.length !== ids.length) throw new HttpError(400, 'Panel teachers must be registered');
  if (await Panel.exists({ id: id.trim() })) throw new HttpError(409, 'Panel ID already exists');
  return Panel.create({
    id: id.trim(),
    teachers: teachers.map((teacher) => ({
      employeeId: teacher.employeeId,
      name: accounts.find((account) => account.employeeId === teacher.employeeId).name,
      panelHead: teacher.panelHead === true,
    })),
  });
}

function listPanels(id) {
  return Panel.find(id ? { id } : {});
}

async function deletePanel(id) {
  requireRecord(await Panel.findOne({ id }), 'Panel');
  return mongoose.connection.transaction(async (session) => {
    const panel = requireRecord(await Panel.findOneAndDelete({ id }, { session }), 'Panel');
    await PanelAssignment.deleteMany({ panelId: panel.id }, { session });
    return { message: 'Panel and its assignments deleted successfully' };
  });
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
  const ids = [...new Set(studentIds)];
  if ((await Project.countDocuments({ ProjectId: { $in: ids }, retiredAt: null })) !== ids.length)
    throw new HttpError(400, 'Choose existing project identifiers');
  return PanelAssignment.findOneAndUpdate(
    { panelId },
    { $addToSet: { studentIds: { $each: ids } } },
    { upsert: true, returnDocument: 'after', runValidators: true },
  );
}

async function renamePanel(id, newPanelId) {
  if (typeof newPanelId !== 'string' || !newPanelId.trim()) {
    throw new HttpError(400, 'New panel ID is required');
  }
  newPanelId = newPanelId.trim();
  if (newPanelId !== id && (await Panel.exists({ id: newPanelId.trim() })))
    throw new HttpError(409, 'Panel ID already exists');
  return mongoose.connection.transaction(async (session) => {
    const panel = requireRecord(
      await Panel.findOneAndUpdate(
        { id },
        { $set: { id: newPanelId } },
        { returnDocument: 'after', runValidators: true, session },
      ),
      'Panel',
    );
    await PanelAssignment.updateMany(
      { panelId: id },
      { $set: { panelId: newPanelId } },
      { session },
    );
    return panel;
  });
}

module.exports = { createPanel, listPanels, deletePanel, assignPanel, renamePanel };
