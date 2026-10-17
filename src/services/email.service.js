const Email = require('../models/email.model');
const smtp = require('../integrations/smtp/client');
const { ROLES } = require('../constants/roles');
const { HttpError } = require('../errors/http-error');

const EMAIL_ADDRESS = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;

function validateMessage({ recipientEmail, subject, message }) {
  const required = [recipientEmail, subject, message];
  if (
    !required.every((value) => typeof value === 'string' && value.trim()) ||
    !EMAIL_ADDRESS.test(recipientEmail) ||
    subject.length > 200 ||
    message.length > 50000
  ) {
    throw new HttpError(400, 'A recipient email, subject and message are required');
  }
}

async function sendEmail(sender, input) {
  validateMessage(input);
  const email = {
    sender,
    recipient: input.recipientEmail,
    subject: input.subject,
    text: input.message,
  };
  await smtp.sendMessage(email);
  await Email.create(email);
}

function listMailbox(actor, email, field) {
  if (actor.role !== ROLES.ADMIN && email !== actor.email) {
    throw new HttpError(403, 'Insufficient permissions');
  }
  return Email.find({ [field]: email });
}

module.exports = { sendEmail, listMailbox };
