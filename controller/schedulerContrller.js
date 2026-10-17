const Model = require('../model/SchedulerModel');
const { crud } = require('../src/crud');
const handlers = crud(Model, 'Scheduler');

const { dateRange } = require('../src/validation');
exports.createScheduler = handlers.create(req => { dateRange(req.body.start, req.body.end); return req.body; });
exports.getAllSchedulers = handlers.list();
exports.getSchedulerById = handlers.get();
exports.updateSchedulerById = handlers.update();
exports.deleteSchedulerById = handlers.remove();
