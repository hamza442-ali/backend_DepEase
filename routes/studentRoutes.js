const express = require('express');
const router = express.Router();
const studentController = require('../controller/studentController');

// Create a new student
router.post('/add', studentController.createStudent);

// Get all students
router.get('/getall', studentController.getAllStudents);

// Get a single student by ID
router.get('/getone/:id', studentController.getStudentById);



// Update a student by ID
router.put('/update/:id', studentController.updateStudentById);

// Delete a student by ID
router.delete('/delete/:id', studentController.deleteStudentById);

// login verification of a student
    router.post('/login', studentController.studentLogin);

module.exports = router;
