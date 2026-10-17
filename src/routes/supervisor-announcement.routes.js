const { staff } = require('../middleware/access');
const { Router } = require('express');
const router = Router();
const announcementController = require('../controllers/supervisor-announcement.controller');

router.post('/add', staff, announcementController.addAnnouncement);

router.get('/getmine/:ProjectId', announcementController.getAnnouncementsByProjectId);

module.exports = router;
