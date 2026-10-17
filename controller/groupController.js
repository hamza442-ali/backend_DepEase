const Model = require('../model/groupModel');
const { crud } = require('../src/crud');
const { asyncHandler, HttpError } = require('../src/http');
const handlers = crud(Model, 'Group');

exports.createGroup = handlers.create(req => {
  const { teamLeadId, teammate1Id, teammate2Id } = req.body;
  const members = [teamLeadId, teammate1Id, teammate2Id];
  if (members.some(id => typeof id !== 'string' || !id.trim()) || new Set(members).size !== 3) {
    throw new HttpError(400, 'A group requires three different student IDs');
  }
  return { teamLeadId, teammate1Id, teammate2Id };
});
exports.getGroups = handlers.list();
exports.getGroupByMatching = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const group = handlers.requireRecord(await Model.findOne({ $or: [{ teamLeadId: id }, { teammate1Id: id }, { teammate2Id: id }] }));
  res.json({ _id: group._id });
});
exports.getGroupById = handlers.get();
exports.updateGroup = handlers.update();
exports.deleteGroup = handlers.remove();
