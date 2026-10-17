const Model = require('../model/evalutaionModel');
const { crud } = require('../src/crud');
const handlers = crud(Model, 'Evaluation');

exports.createEvaluation = handlers.create();
exports.getAllEvaluations = handlers.list();
exports.updateEvaluation = handlers.update();
exports.deleteEvaluation = handlers.remove();
