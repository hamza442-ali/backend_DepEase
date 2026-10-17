const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');

// Get all students
router.get('/getme/:id', studentController.getStudent);

// Get a single student by ID
router.get('/getone/:id', studentController.getStudentById);

module.exports = router;
