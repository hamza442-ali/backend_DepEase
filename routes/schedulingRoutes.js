const express = require('express');
const router = express.Router();

const schedulingController = require('../controller/schedulingController');

// GET /scheduling
router.get('/getAll', schedulingController.getAll);



// POST /scheduling
router.post('/create', schedulingController.createSchedule);

//update
router.put('/update/:id', schedulingController.updateSchedule);

// DELETE /scheduling/:id
router.delete('/delete', schedulingController.deleteSchedule);

module.exports = router;