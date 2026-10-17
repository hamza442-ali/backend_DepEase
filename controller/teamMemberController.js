const Model = require('../model/teamMemberModel');
const { crud } = require('../src/crud');
const { asyncHandler } = require('../src/http');
const handlers = crud(Model, 'Team member');

exports.addTeamMember = asyncHandler(async (req, res) => {
  await Model.create(req.body);
  res.status(200).json({ message: 'Team member added successfully' });
});
exports.deleteTeamMember = asyncHandler(async (req, res) => {
  const { projectid, student_id } = req.params;
  handlers.requireRecord(await Model.findOneAndDelete({ projectid, student_id }));
  res.json({ message: 'Team member deleted successfully' });
});
exports.getAllTeamMembers = handlers.list(req => ({ projectid: req.params.projectid }));
exports.getTeamMemberById = handlers.get();
exports.assignRoleToTeamMember = handlers.update(req => req.params.id, req => ({ student_role: req.body.student_role }));
exports.assignRequirementsToTeamMember = handlers.update(req => req.params.id, req => ({ requirements: req.body.requirements }));
