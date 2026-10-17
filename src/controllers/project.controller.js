const Project = require('../models/project.model');
const { createCrudHandlers } = require('./crud-handlers');
const handlers = createCrudHandlers(Project, 'Project');

exports.createProject = handlers.create();
exports.getAllProject = handlers.list();
exports.getMineProject = handlers.get();
exports.getAllMineProject = handlers.list((req) => ({ teacher: req.params.teacher }));
exports.getProjectBygroup = handlers.list((req) => ({ group: req.params.group }));
exports.updateProjectById = handlers.update((req) => req.params.projectId);
exports.deleteProjectById = handlers.remove((req) => req.params.projectId);
