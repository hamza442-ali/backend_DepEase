const email = require('../services/email.service');
const { asyncHandler } = require('../utils/async-handler');

exports.sendEmail = asyncHandler(async (req, res) => {
  await email.sendEmail(req.user.email, req.body);
  res.json({ message: 'Email sent successfully' });
});

exports.getEmailsSentByUser = asyncHandler(async (req, res) => {
  res.json(await email.listMailbox(req.user, req.params.sender, 'sender'));
});

exports.getEmailsReceivedByUser = asyncHandler(async (req, res) => {
  res.json(await email.listMailbox(req.user, req.params.recipient, 'recipient'));
});
