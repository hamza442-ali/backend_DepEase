const { Router } = require('express');
const router = Router();
const announcementController = require('../controllers/admin-announcement.controller');

router.get('/getall', announcementController.getAllAnnouncements);

module.exports = router;
