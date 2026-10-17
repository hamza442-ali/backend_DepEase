const { Router } = require('express');
const router = Router();

const evaluationController = require('../controllers/evaluation.controller');

router.post('/create', evaluationController.createEvaluation);

router.put('/updateEvaluation/:id', evaluationController.updateEvaluation);

router.delete('/deleteEvaluation/:id', evaluationController.deleteEvaluation);

router.get('/getAll', evaluationController.getAllEvaluations);

module.exports = router;
