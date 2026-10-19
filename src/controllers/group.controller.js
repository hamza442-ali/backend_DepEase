const Group = require('../models/group.model');
const { createCrudHandlers } = require('./crud-handlers');
const { asyncHandler } = require('../utils/async-handler');
const { HttpError } = require('../errors/http-error');
const access = require('../services/project-access.service');
const handlers = createCrudHandlers(Group, 'Group');

exports.createGroup = handlers.create((req) => {
  const { teamLeadId, teammate1Id, teammate2Id } = req.body;
  const members = [teamLeadId, teammate1Id, teammate2Id];
  if (members.some((id) => typeof id !== 'string' || !id.trim()) || new Set(members).size !== 3) {
    throw new HttpError(400, 'A group requires three different student IDs');
  }
  return { teamLeadId, teammate1Id, teammate2Id };
});
exports.getGroups = handlers.list();
exports.getGroupByMatching = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const group = handlers.requireRecord(
    await Group.findOne({ $or: [{ teamLeadId: id }, { teammate1Id: id }, { teammate2Id: id }] }),
  );
  await access.authorizeRecord(Group, req, group);
  res.json({ _id: group._id });
});
exports.getGroupById = handlers.get();
exports.updateGroup = handlers.update();
exports.deleteGroup = handlers.remove();
