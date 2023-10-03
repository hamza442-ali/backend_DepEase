const express = require('express');
const router = express.Router();
const emailController = require('../controller/emailController');

// Send email
router.post('/send', emailController.sendEmail);

// Get all emails sent by a user
router.get('/getsent/:sender', emailController.getEmailsSentByUser);

// Get all emails received by a user
router.get('/getreceived/:recipient', emailController.getEmailsReceivedByUser);



module.exports = router;
