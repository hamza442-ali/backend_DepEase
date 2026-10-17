const { Router } = require('express');
const announcementController = require('../controllers/admin-announcement.controller');

const router = Router();

router.get('/getall', announcementController.getAllAnnouncements);

module.exports = router;
