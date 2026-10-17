const nodemailer = require('nodemailer');
const { smtpSettings } = require('../../config/integrations');

async function sendMessage({ sender, recipient, subject, text }) {
  const settings = smtpSettings();
  const transport = nodemailer.createTransport(settings.transport);
  return transport.sendMail({
    from: settings.from,
    replyTo: sender,
    to: recipient,
    subject,
    text,
  });
}

module.exports = { sendMessage };
