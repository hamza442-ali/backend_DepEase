const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/supervisor-announcement.controller');

// POST /api/announcements
router.post(
  '/add',
  require('../auth').requireRoles('teacher', 'admin'),
  announcementController.addAnnouncement,
);

// GET /api/announcements/project/:ProjectId
router.get('/getmine/:ProjectId', announcementController.getAnnouncementsByProjectId);

module.exports = router;
