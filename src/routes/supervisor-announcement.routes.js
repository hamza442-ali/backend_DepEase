const { staff } = require('../middleware/access');
const { Router } = require('express');
const announcementController = require('../controllers/supervisor-announcement.controller');

const router = Router();

router.post('/add', staff, announcementController.addAnnouncement);

router.get('/getmine/:ProjectId', announcementController.getAnnouncementsByProjectId);

module.exports = router;
