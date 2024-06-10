const express = require('express');
const router = express.Router();

const evaluationController = require('../controller/evaluationController');
 
// Get all evaluations
router.get('/getAll', evaluationController.getAllEvaluations);


module.exports = router;