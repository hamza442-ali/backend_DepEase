const Project = require('../models/project.model');
const { createCrudHandlers } = require('./crud-handlers');
const handlers = createCrudHandlers(Project, 'Project');

exports.createProject = handlers.create();
exports.listProjects = handlers.list();
exports.getProjectById = handlers.get();
exports.listProjectsByTeacher = handlers.list((req) => ({ teacher: req.params.teacher }));
exports.listProjectsByGroup = handlers.list((req) => ({ group: req.params.group }));
exports.updateProject = handlers.update((req) => req.params.projectId);
exports.deleteProject = handlers.remove((req) => req.params.projectId);
