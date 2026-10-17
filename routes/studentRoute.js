const { requireRoles } = require('../src/auth');
const admin = requireRoles('admin');

const express = require('express');
const router = express.Router();

const studentController = require("../controllers/studentController");

// get all students
router.get('/getAllStudents', admin, studentController.getAllStudents);

// create student
router.post('/create', admin, studentController.createStudent);

router.delete('/delete/:id', admin, studentController.deleteStudentById);

module.exports = router;
