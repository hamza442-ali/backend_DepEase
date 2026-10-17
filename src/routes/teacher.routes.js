const { Router } = require('express');
const router = Router({ caseSensitive: true });
const teacherController = require('../controllers/teacher.controller');

router.get('/getall', teacherController.getTeachers);

router.get('/getme/:registration_number', teacherController.getTeacherByRegistrationNumber);

module.exports = router;
