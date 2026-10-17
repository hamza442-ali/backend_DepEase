const Requirement = require('../models/requirement.model');
const { HttpError } = require('../errors/http-error');
const { arrayValue } = require('../utils/validation');
const { requireRecord } = require('../utils/records');

function prepareRequirement(input) {
  const requirement = { ...input };
  for (const field of ['assignedTo', 'comments', 'attachments']) {
    requirement[field] = arrayValue(requirement[field], field);
  }
  return requirement;
}

async function addAttachment(id, attachment) {
  if (typeof attachment !== 'string' || !attachment)
    throw new HttpError(400, 'Attachment is required');
  const requirement = requireRecord(await Requirement.findById(id), 'Requirement');
  requirement.attachments.push(attachment);
  return requirement.save();
}

async function addComment(id, content, authorEmail) {
  const requirement = requireRecord(await Requirement.findById(id), 'Requirement');
  requirement.comments.push({ content, createdBy: authorEmail });
  return requirement.save();
}

async function listComments(id) {
  return requireRecord(await Requirement.findById(id), 'Requirement').comments;
}

module.exports = { prepareRequirement, addAttachment, addComment, listComments };
