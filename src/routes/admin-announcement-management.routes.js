const { Router } = require('express');
const router = Router();
const announcementController = require('../controllers/makeAnnouncemenetController');

router.post('/add', announcementController.makeAnnouncement);

router.get('/getAll', announcementController.getAnnouncement);

router.delete('/delete/:id', announcementController.deleteAnnouncement);

module.exports = router;
