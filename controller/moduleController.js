const Model = require('../model/moduleModel');
const { crud } = require('../src/crud');
const handlers = crud(Model, 'Module');

exports.createModule = handlers.create();
exports.getModules = handlers.list();
exports.getModuleById = handlers.list(req => ({ projectId: req.params.projectId }));
exports.updateModule = handlers.update();
exports.deleteModule = handlers.remove();
