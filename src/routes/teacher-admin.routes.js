const { admin } = require('../middleware/access');
const { Router } = require('express');

const teacherController = require('../controllers/teacher.controller');

const router = Router({ caseSensitive: true });

router.get('/getAll', admin, teacherController.getAllTeachers);
router.get(['/getOne/:id', '/getOne:id'], admin, teacherController.getTeacherById);
router.post('/create', admin, teacherController.createTeacher);
router.put('/update', admin, teacherController.selectTeachers);
router.put('/updateFalse', admin, teacherController.clearTeacherSelection);
router.delete('/delete/:id', admin, teacherController.deleteTeacherByEmployeeId);

module.exports = router;
