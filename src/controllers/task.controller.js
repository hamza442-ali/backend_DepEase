const Task = require('../models/task.model');
const { createCrudHandlers } = require('./crud-handlers');
const handlers = createCrudHandlers(Task, 'Task');

exports.getAllTasks = handlers.list();
exports.listTasksByProjectId = handlers.list((req) => ({ projectid: req.params.projectid }));
exports.createTask = handlers.create();
exports.updateTask = handlers.update(
  (req) => req.params.id,
  (req) => ({ status: req.body.status }),
);
exports.deleteTask = handlers.remove();
