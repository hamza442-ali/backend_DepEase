const { Router } = require('express');
const router = Router();
const studentController = require('../controllers/student.controller');

router.get('/getme/:id', studentController.getStudent);

router.get('/getone/:id', studentController.getStudentById);

module.exports = router;
