const { admin } = require('../middleware/access');
const { Router } = require('express');
const router = Router({ caseSensitive: true });

const teacherController = require('../controllers/teacher.controller');

router.get('/getAll', admin, teacherController.getAllTeachers);
router.get(['/getOne/:id', '/getOne:id'], admin, teacherController.getTeacherById);
router.post('/create', admin, teacherController.createTeacher);
router.put('/update', admin, teacherController.updateTeacherIsSelected);
router.put('/updateFalse', admin, teacherController.updateIsSelectedFalse);
router.delete('/delete/:id', admin, teacherController.deleteTeacherById);

module.exports = router;
