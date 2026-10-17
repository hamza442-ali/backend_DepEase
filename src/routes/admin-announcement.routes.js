const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/admin-announcement.controller');

// Route to get all announcements
router.get('/getall', announcementController.getAllAnnouncements);

module.exports = router;
