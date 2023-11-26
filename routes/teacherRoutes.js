// routes/teacherRoutes.js
const express = require('express');
const router = express.Router();
const teacherController = require('../controller/teacherController');


// Get all teachers
router.get('/getall', teacherController.getTeachers);

// Get a teacher by registration number
router.get('/getme/:registration_number', teacherController.getTeacherByRegistrationNumber);


module.exports = router;
