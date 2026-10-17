const { Router } = require('express');

const assignmentController = require('../controllers/panel-assignment.controller');

const router = Router();

router.get('/getall', assignmentController.getAssignments);

module.exports = router;
