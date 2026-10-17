const { Router } = require('express');
const router = Router();
const schedulerController = require('../controllers/project-scheduler.controller');

router.post('/scheduler', schedulerController.createScheduler);

router.get('/scheduler', schedulerController.getAllSchedulers);

router.get('/scheduler/:id', schedulerController.getSchedulerById);

router.put('/scheduler/:id', schedulerController.updateSchedulerById);

router.delete('/scheduler/:id', schedulerController.deleteSchedulerById);

module.exports = router;
