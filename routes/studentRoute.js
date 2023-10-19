
const express = require('express');
const router = express.Router();

const studentController = require("../controllers/studentController");

// get all students
router.get('/getAllStudents', studentController.getAllStudents);

module.exports = router;
