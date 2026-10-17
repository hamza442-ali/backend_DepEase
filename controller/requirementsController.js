const Model = require('../model/requirmentsModel');
const { crud } = require('../src/crud');
const { asyncHandler, HttpError } = require('../src/http');
const handlers = crud(Model, 'Requirement');

const { arrayValue } = require('../src/validation');
exports.createRequirement = handlers.create(req => {
  const body = { ...req.body };
  for (const field of ['assignedTo', 'comments', 'attachments']) body[field] = arrayValue(body[field], field);
  return body;
});
exports.getAllRequirements = handlers.list(req => ({ projectid: req.params.projectid }));
exports.getRequirementById = handlers.get();
exports.updateRequirement = handlers.update();
exports.deleteRequirement = handlers.remove();
exports.updatePriority = handlers.update(req => req.params.id, req => ({ priority: req.body.priority }));
exports.updateDeadline = handlers.update(req => req.params.id, req => ({ deadline: req.body.deadline }));
exports.uploadAttachment = asyncHandler(async (req, res) => {
  if (typeof req.body.attachment !== 'string' || !req.body.attachment) throw new HttpError(400, 'Attachment is required');
  const record = handlers.requireRecord(await Model.findById(req.params.id));
  record.attachments.push(req.body.attachment);
  res.json(await record.save());
});
exports.addComment = asyncHandler(async (req, res) => {
  const record = handlers.requireRecord(await Model.findById(req.params.id));
  record.comments.push({ content: req.body.content, createdBy: req.user.email });
  res.json(await record.save());
});
exports.getAllComments = asyncHandler(async (req, res) => {
  res.json(handlers.requireRecord(await Model.findById(req.params.id)).comments);
});
