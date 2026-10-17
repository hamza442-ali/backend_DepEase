const { admin } = require('../middleware/access');

const { Router } = require('express');

const studentController = require('../controllers/student.controller');

const router = Router();

router.get('/getAllStudents', admin, studentController.getAllStudents);

router.post('/create', admin, studentController.createStudent);

router.delete('/delete/:id', admin, studentController.deleteStudentByRegistrationNumber);

module.exports = router;
