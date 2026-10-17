const { Router } = require('express');
const router = Router();
const emailController = require('../controllers/email.controller');

router.post('/send', emailController.sendEmail);

router.get('/getsent/:sender', emailController.getEmailsSentByUser);

router.get('/getreceived/:recipient', emailController.getEmailsReceivedByUser);

module.exports = router;
