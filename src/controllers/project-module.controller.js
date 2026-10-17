const ProjectModule = require('../models/project-module.model');
const { createCrudHandlers } = require('./crud-handlers');
const handlers = createCrudHandlers(ProjectModule, 'Module');

exports.createModule = handlers.create();
exports.getModules = handlers.list();
exports.getModuleById = handlers.list((req) => ({ projectId: req.params.projectId }));
exports.updateModule = handlers.update();
exports.deleteModule = handlers.remove();
