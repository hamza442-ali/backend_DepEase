// routes/teacherRoutes.js
const express = require('express');
const router = express.Router({ caseSensitive: true });
const teacherController = require('../controllers/teacher.controller');

// Get all teachers
router.get('/getall', teacherController.getTeachers);

// Get a teacher by registration number
router.get('/getme/:registration_number', teacherController.getTeacherByRegistrationNumber);

module.exports = router;
