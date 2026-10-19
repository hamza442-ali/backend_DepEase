const Project = require('../models/project.model');
const { createCrudHandlers } = require('./crud-handlers');
const handlers = createCrudHandlers(Project, 'Project');
const { asyncHandler } = require('../utils/async-handler');
const { projectsFor } = require('../services/project-access.service');
const { HttpError } = require('../errors/http-error');

exports.createProject = handlers.create();
exports.listProjects = handlers.list();
exports.getProjectById = handlers.get();
exports.listProjectsByTeacher = asyncHandler(async (req, res) => {
  if (req.user.role === 'admin')
    return res.json(await Project.find({ teacher: req.params.teacher, retiredAt: null }));
  if (req.user.role !== 'teacher' || req.params.teacher !== req.actor.employeeId)
    throw new HttpError(403, 'Insufficient permissions');
  res.json(await projectsFor(req));
});
exports.listProjectsByGroup = handlers.list((req) => ({ group: req.params.group }));
exports.updateProject = handlers.update((req) => req.params.projectId);
exports.deleteProject = handlers.remove((req) => req.params.projectId);
