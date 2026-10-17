const { requireRoles } = require('../middleware/authorize-roles');
const admin = requireRoles('admin');

const express = require('express');
const router = express.Router();

const studentController = require('../controllers/student.controller');

// get all students
router.get('/getAllStudents', admin, studentController.getAllStudents);

// create student
router.post('/create', admin, studentController.createStudent);

router.delete('/delete/:id', admin, studentController.deleteStudentById);

module.exports = router;
