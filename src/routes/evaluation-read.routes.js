const { Router } = require('express');
const router = Router();

const evaluationController = require('../controllers/evaluation.controller');

router.get('/getAll', evaluationController.getAllEvaluations);

module.exports = router;
