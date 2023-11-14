const express = require('express');
const router = express.Router();
const studentController = require('../controller/studentController');


// Get all students
router.get('/getme/:id', studentController.getStudent);

// Get a single student by ID
router.get('/getone/:id', studentController.getStudentById);


// login verification of a student
    router.post('/login', studentController.studentLogin);

module.exports = router;
