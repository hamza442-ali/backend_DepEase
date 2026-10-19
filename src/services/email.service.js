const Email = require('../models/email.model');
const smtp = require('../integrations/smtp/client');
const { ROLES } = require('../constants/roles');
const { HttpError } = require('../errors/http-error');
const Student = require('../models/student.model');
const Teacher = require('../models/teacher.model');

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
  const recipient = input.recipientEmail.trim().toLowerCase();
  const registered =
    (await Student.exists({ email_address: recipient })) ||
    (await Teacher.exists({ email: recipient }));
  const smtpConfigured = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM'].every(
    (key) => process.env[key],
  );
  if (!registered && !smtpConfigured)
    throw new HttpError(
      503,
      'This recipient is outside DepEase. Email delivery is not configured.',
    );
  const email = {
    sender,
    recipient,
    subject: input.subject,
    text: input.message,
  };
  // Registered accounts can always communicate in DepEase. SMTP adds an email notification.
  if (!registered) {
    await smtp.sendMessage(email);
    await Email.create({ ...email, deliveryStatus: 'sent' });
    return { message: 'Email sent successfully', delivery: 'sent' };
  }
  const saved = await Email.create({ ...email, deliveryStatus: 'internal' });
  if (!smtpConfigured)
    return { message: 'Message delivered to the DepEase inbox.', delivery: 'internal' };
  try {
    await smtp.sendMessage(email);
    saved.deliveryStatus = 'sent';
    await saved.save();
    return { message: 'Message delivered in DepEase and by email.', delivery: 'sent' };
  } catch {
    saved.deliveryStatus = 'failed';
    await saved.save();
    return {
      message: 'Message delivered in DepEase. The email notification could not be sent.',
      delivery: 'internal',
    };
  }
}

function listMailbox(actor, email, field) {
  if (actor.role !== ROLES.ADMIN && email !== actor.email) {
    throw new HttpError(403, 'Insufficient permissions');
  }
  return Email.find({ [field]: email });
}

module.exports = { sendEmail, listMailbox };
