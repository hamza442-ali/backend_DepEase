const ProjectScheduler = require('../models/project-scheduler.model');
const { createCrudHandlers } = require('./crud-handlers');
const handlers = createCrudHandlers(ProjectScheduler, 'Scheduler');

const { dateRange } = require('../utils/validation');
exports.createScheduler = handlers.create((req) => {
  dateRange(req.body.start, req.body.end);
  return req.body;
});
exports.getAllSchedulers = handlers.list();
exports.getSchedulerById = handlers.get();
exports.updateSchedulerById = handlers.update();
exports.deleteSchedulerById = handlers.remove();
