const express = require('express');
const router = express.Router();

const schedulingController = require('../controllers/schedule-slot.controller');
const staff = require('../auth').requireRoles('teacher', 'admin');

// GET /scheduling
router.get('/getAll', schedulingController.getAll);

// POST /scheduling
router.post('/create', staff, schedulingController.createSchedule);

//update
router.put('/update/:id', staff, schedulingController.updateSchedule);

// DELETE /scheduling/:id
router.delete('/delete', staff, schedulingController.deleteSchedule);

module.exports = router;
