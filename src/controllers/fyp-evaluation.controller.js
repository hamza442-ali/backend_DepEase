const FypEvaluation = require('../models/fyp-evaluation.model');
const { createCrudHandlers } = require('./crud-handlers');
const handlers = createCrudHandlers(FypEvaluation, 'FYP evaluation');

class FYPProjectController {
  static createFYPProject = handlers.create();
  static updateFYPProject = handlers.update();
  static getAllEvaluation = handlers.list();
}
module.exports = FYPProjectController;
