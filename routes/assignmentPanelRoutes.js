const express = require('express');
const router = express.Router();


const assignmentController = require('../controller/assignmentPanelController');

//get by peanel id
router.get('/getall', assignmentController.getAssignments);


module.exports = router;