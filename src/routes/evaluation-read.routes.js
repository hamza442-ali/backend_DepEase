const express = require('express');
const router = express.Router();

const evaluationController = require('../controllers/evaluation.controller');

// Get all evaluations
router.get('/getAll', evaluationController.getAllEvaluations);

module.exports = router;
