const TeamMember = require('../models/team-member.model');
const { createCrudHandlers } = require('./crud-handlers');
const { asyncHandler } = require('../utils/async-handler');
const access = require('../services/project-access.service');
const handlers = createCrudHandlers(TeamMember, 'Team member');

exports.addTeamMember = asyncHandler(async (req, res) => {
  await TeamMember.create(await access.prepareCreate(TeamMember, req, req.body));
  res.status(200).json({ message: 'Team member added successfully' });
});
exports.deleteTeamMember = asyncHandler(async (req, res) => {
  const { projectid, student_id } = req.params;
  await access.projectAccess(req, projectid, { write: true });
  handlers.requireRecord(await TeamMember.findOneAndDelete({ projectid, student_id }));
  res.json({ message: 'Team member deleted successfully' });
});
exports.getAllTeamMembers = handlers.list((req) => ({ projectid: req.params.projectid }));
exports.getTeamMemberById = handlers.get();
exports.assignRoleToTeamMember = handlers.update(
  (req) => req.params.id,
  (req) => ({ student_role: req.body.student_role }),
);
exports.assignRequirementsToTeamMember = handlers.update(
  (req) => req.params.id,
  (req) => ({ requirements: req.body.requirements }),
);
