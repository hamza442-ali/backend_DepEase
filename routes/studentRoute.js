
const express = require('express');
const router = express.Router();

const studentController = require("../controllers/studentController");

// get all students
router.get('/getAllStudents', studentController.getAllStudents);

// create student
router.post('/create', studentController.createStudent);

router.delete('/delete/:id', studentController.deleteStudentById);

module.exports = router;
