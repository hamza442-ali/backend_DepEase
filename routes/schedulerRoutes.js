const express = require('express');
const router = express.Router();
const schedulerController = require('./schedulerController');

// Create a new scheduler
router.post('/scheduler', schedulerController.createScheduler);

// Get all schedulers
router.get('/scheduler', schedulerController.getAllSchedulers);

// Get a specific scheduler by ID
router.get('/scheduler/:id', schedulerController.getSchedulerById);

// Update a scheduler by ID
router.put('/scheduler/:id', schedulerController.updateSchedulerById);

// Delete a scheduler by ID
router.delete('/scheduler/:id', schedulerController.deleteSchedulerById);

module.exports = router;
