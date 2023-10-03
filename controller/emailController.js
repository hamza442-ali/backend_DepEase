const nodemailer = require('nodemailer');
const Email = require('../model/emailModel.js');


const sendEmail = async (req, res) => {
  try {
    const sender = req.body.sender;
    const recipientEmail = req.body.recipientEmail;
    const subject = req.body.subject;
    const message = req.body.message;

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      // Configuration options for the email service
      // For example, using SMTP to send email via Gmail:
      service: 'Gmail',
      auth: {
        user: 'i200457@nu.edu.pk',
        pass: 'ocyqkbezzjjyttmi',
      },
    });

    // Prepare the email message
    const mailOptions = {
      from: sender,
      to: recipientEmail,
      subject: subject,
      text: message,
    };

    // Send the email using the transporter
    await transporter.sendMail(mailOptions);

    // Save the sent email to the database
    const email = new Email({
      sender: sender,
      recipient: recipientEmail,
      subject: subject,
      text: message,
    });
    await email.save();

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send email' });
  }
};

  
  // Controller function to fetch all emails sent by a user
const getEmailsSentByUser = async (req, res) => {
    try {
      const { sender } = req.params;
      const emails = await Email.find({ sender });
      res.json(emails);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch sent emails' });
    }
  };
  
  // Controller function to fetch all emails received by a user
  const getEmailsReceivedByUser = async (req, res) => {
    try {
      
      const { recipient } = req.params;
      
      const emails = await Email.find({ recipient });
     
      res.json(emails);
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch received emails' });
    }
  };
  

  module.exports = {
    sendEmail,
    getEmailsReceivedByUser,
    getEmailsSentByUser,
  };