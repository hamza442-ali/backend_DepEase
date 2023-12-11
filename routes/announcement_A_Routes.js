const express = require('express');
const router = express.Router();
const announcementController = require('../controller/announcement_A_Controller');

// Route to get all announcements
router.get('/getall', announcementController.getAllAnnouncements);

module.exports = router;
