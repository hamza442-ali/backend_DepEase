const express = require('express');
const router = express.Router();
const announcementController = require('../controller/announcement_S_Controller');

// POST /api/announcements
router.post('/add', require('../src/auth').requireRoles('teacher', 'admin'), announcementController.addAnnouncement);

// GET /api/announcements/project/:ProjectId
router.get('/getmine/:ProjectId', announcementController.getAnnouncementsByProjectId);

module.exports = router;
