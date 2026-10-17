const Panel = require('../models/panel.model');
const { createCrudHandlers } = require('./crud-handlers');
const handlers = createCrudHandlers(Panel, 'Panel');
exports.getAllPanelsByTeacherId = handlers.list((req) => ({
  'teachers.employeeId': req.params.teacherId,
}));
