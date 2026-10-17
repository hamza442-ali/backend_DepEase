const Model = require('../model/evaluationModel');
const { crud } = require('../src/crud');
const handlers = crud(Model, 'FYP evaluation');

class FYPProjectController {
  static createFYPProject = handlers.create();
  static updateFYPProject = handlers.update();
  static getAllEvaluation = handlers.list();
}
module.exports = FYPProjectController;
