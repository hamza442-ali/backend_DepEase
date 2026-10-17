const Model = require('../model/taskModel');
const { crud } = require('../src/crud');
const handlers = crud(Model, 'Task');

exports.getAllTasks = handlers.list();
exports.getbyProjectId = handlers.list(req => ({ projectid: req.params.projectid }));
exports.createTask = handlers.create();
exports.updateTask = handlers.update(req => req.params.id, req => ({ status: req.body.status }));
exports.deleteTask = handlers.remove();
