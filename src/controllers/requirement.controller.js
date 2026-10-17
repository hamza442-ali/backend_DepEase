const Requirement = require('../models/requirement.model');
const requirements = require('../services/requirement.service');
const { createCrudHandlers } = require('./crud-handlers');
const { asyncHandler } = require('../utils/async-handler');

const handlers = createCrudHandlers(Requirement, 'Requirement');
exports.createRequirement = handlers.create((req) => requirements.prepareRequirement(req.body));
exports.getAllRequirements = handlers.list((req) => ({ projectid: req.params.projectid }));
exports.getRequirementById = handlers.get();
exports.updateRequirement = handlers.update();
exports.deleteRequirement = handlers.remove();
exports.updatePriority = handlers.update(
  (req) => req.params.id,
  (req) => ({ priority: req.body.priority }),
);
exports.updateDeadline = handlers.update(
  (req) => req.params.id,
  (req) => ({ deadline: req.body.deadline }),
);
exports.uploadAttachment = asyncHandler(async (req, res) => {
  res.json(await requirements.addAttachment(req.params.id, req.body.attachment));
});
exports.addComment = asyncHandler(async (req, res) => {
  res.json(await requirements.addComment(req.params.id, req.body.content, req.user.email));
});
exports.getAllComments = asyncHandler(async (req, res) => {
  res.json(await requirements.listComments(req.params.id));
});
