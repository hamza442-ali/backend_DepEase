const nodemailer = require('nodemailer');
const Email = require('../models/email.model');
const { asyncHandler } = require('../utils/async-handler');
const { HttpError } = require('../errors/http-error');
const { createCrudHandlers } = require('./crud-handlers');
exports.sendEmail = asyncHandler(async (req, res) => {
  const { recipientEmail, subject, message } = req.body;
  if (
    ![recipientEmail, subject, message].every(
      (value) => typeof value === 'string' && value.trim(),
    ) ||
    !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(recipientEmail) ||
    subject.length > 200 ||
    message.length > 50000
  ) {
    throw new HttpError(400, 'A recipient email, subject and message are required');
  }
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM)
    throw new HttpError(503, 'Email integration is not configured');
  const port = Number(process.env.SMTP_PORT || 587);
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    connectionTimeout: 10000,
    socketTimeout: 20000,
  });
  const sender = req.user.email;
  await transport.sendMail({
    from: SMTP_FROM,
    replyTo: sender,
    to: recipientEmail,
    subject,
    text: message,
  });
  await Email.create({ sender, recipient: recipientEmail, subject, text: message });
  res.json({ message: 'Email sent successfully' });
});
const handlers = createCrudHandlers(Email, 'Email');
function mailbox(field, parameter) {
  return handlers.list((req) => {
    const email = req.params[parameter];
    if (req.user.role !== 'admin' && email !== req.user.email)
      throw new HttpError(403, 'Insufficient permissions');
    return { [field]: email };
  });
}
exports.getEmailsSentByUser = mailbox('sender', 'sender');
exports.getEmailsReceivedByUser = mailbox('recipient', 'recipient');
