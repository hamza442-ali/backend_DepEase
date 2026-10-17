

const express = require('express');
const router = express.Router();
const announcementController = require ('../controllers/makeAnnouncemenetController');


router.post('/add', announcementController.makeAnnouncement);

router.get('/getAll', announcementController.getAnnouncement);

//delete announcement by id
router.delete('/delete/:id', announcementController.deleteAnnouncement);


module.exports = router;