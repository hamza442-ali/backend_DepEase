const express = require('express');
const router = express.Router();

const assignmentController = require('../controllers/panel-assignment.controller');

//get by peanel id
router.get('/getall', assignmentController.getAssignments);

module.exports = router;
