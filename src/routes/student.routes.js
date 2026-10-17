const { Router } = require('express');
const studentController = require('../controllers/student.controller');

const router = Router();

router.get('/getme/:id', studentController.listStudentsByRegistrationNumber);

router.get('/getone/:id', studentController.getStudentById);

module.exports = router;
