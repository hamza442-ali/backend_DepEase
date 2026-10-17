const { Router } = require('express');
const announcementController = require('../controllers/admin-announcement-management.controller');

const router = Router();

router.post('/add', announcementController.makeAnnouncement);

router.get('/getAll', announcementController.getAnnouncement);

router.delete('/delete/:id', announcementController.deleteAnnouncement);

module.exports = router;
