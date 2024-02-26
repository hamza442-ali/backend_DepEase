const express = require('express');
const router = express.Router();
const addMarksController = require('../controller/addMarksController');

// Routes for CRUD operations
router.post('/add', addMarksController.createAddMarks);
router.get('/getall', addMarksController.getAllAddMarks);
router.get('/getmine/:ProjectId', addMarksController.getAddMarksByProjectId);
router.put('/update/:ProjectId', addMarksController.updateAddMarks);
router.delete('/delete/:id', addMarksController.deleteAddMarks);

module.exports = router;
