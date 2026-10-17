const { Router } = require('express');
const router = Router();

const assignmentController = require('../controllers/panel-assignment.controller');

router.get('/getall', assignmentController.getAssignments);

module.exports = router;
