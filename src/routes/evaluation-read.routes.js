const { Router } = require('express');

const evaluationController = require('../controllers/evaluation.controller');

const router = Router();

router.get('/getAll', evaluationController.getAllEvaluations);

module.exports = router;
