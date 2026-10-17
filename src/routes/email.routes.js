const { Router } = require('express');
const emailController = require('../controllers/email.controller');

const router = Router();

router.post('/send', emailController.sendEmail);

router.get('/getsent/:sender', emailController.getEmailsSentByUser);

router.get('/getreceived/:recipient', emailController.getEmailsReceivedByUser);

module.exports = router;
