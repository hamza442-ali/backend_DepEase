const express = require('express');
const router = express.Router();

const teacherController = require('../controllers/teacherController');

// Define your routes here
router.get('/getAll', teacherController.getAllTeachers);
router.get('/getOne:id', teacherController.getTeacherById);
router.post('/create', teacherController.createTeacher);
router.put('/update:id', teacherController.editTeacherById);
router.delete('/delete/:id', teacherController.deleteTeacherById);

module.exports = router;
