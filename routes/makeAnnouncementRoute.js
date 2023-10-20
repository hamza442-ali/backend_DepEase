

const express = require('express');
const router = express.Router();
const announcementController = require ('../controllers/makeAnnouncemenetController');


router.post('/add', announcementController.makeAnnouncement);


module.exports = router;