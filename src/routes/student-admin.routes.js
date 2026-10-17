const { admin } = require('../middleware/access');

const { Router } = require('express');
const router = Router();

const studentController = require('../controllers/student.controller');

router.get('/getAllStudents', admin, studentController.getAllStudents);

router.post('/create', admin, studentController.createStudent);

router.delete('/delete/:id', admin, studentController.deleteStudentById);

module.exports = router;
