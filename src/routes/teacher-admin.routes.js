const { requireRoles } = require('../middleware/authorize-roles');
const admin = requireRoles('admin');
const express = require('express');
const router = express.Router({ caseSensitive: true });

const teacherController = require('../controllers/teacher.controller');

// Define your routes here
router.get('/getAll', admin, teacherController.getAllTeachers);
router.get(['/getOne/:id', '/getOne:id'], admin, teacherController.getTeacherById);
router.post('/create', admin, teacherController.createTeacher);
router.put('/update', admin, teacherController.updateTeacherIsSelected);
router.put('/updateFalse', admin, teacherController.updateIsSelectedFalse);
router.delete('/delete/:id', admin, teacherController.deleteTeacherById);

module.exports = router;
