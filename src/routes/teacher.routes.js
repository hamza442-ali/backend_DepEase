const { Router } = require('express');
const teacherController = require('../controllers/teacher.controller');

const router = Router({ caseSensitive: true });

router.get('/getall', teacherController.getTeachers);

router.get('/getme/:registration_number', teacherController.getTeacherByEmployeeId);

module.exports = router;
