const express = require('express');
const router = express.Router();

const schedulingController = require('../controllers/schedulingController');

// GET /scheduling
router.get('/getAll', schedulingController.getAll);

// GET /scheduling/:id
// router.get('/:id', schedulingController.getById);

// POST /scheduling
router.post('/create', schedulingController.createSchedule);

// PUT /scheduling/:id
// router.put('/:id', schedulingController.update);

// DELETE /scheduling/:id
router.delete('/delete', schedulingController.deleteSchedule);

module.exports = router;
