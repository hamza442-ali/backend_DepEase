const Evaluation = require('../models/evaluation.model');
const { createCrudHandlers } = require('./crud-handlers');
const handlers = createCrudHandlers(Evaluation, 'Evaluation');

exports.createEvaluation = handlers.create();
exports.getAllEvaluations = handlers.list();
exports.updateEvaluation = handlers.update();
exports.deleteEvaluation = handlers.remove();
