
const express = require('express');
const router = express.Router();

const evaluationController = require('../controller/evaluationController');
 

// Create a new evaluation
router.post('/createEvaluation', evaluationController.createEvaluation);
// Update a evaluation  
router.put('/updateEvaluation/:id', evaluationController.updateEvaluation);
// Delete a evaluation
router.delete('/deleteEvaluation/:id', evaluationController.deleteEvaluation);
// Get all evaluations
router.get('/getAllEvaluations', evaluationController.getAllEvaluations);
// Get a single evaluation
// router.get('/getEvaluationById/:id', evaluationController.getEvaluationById);


module.exports = router;