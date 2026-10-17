const PanelAssignment = require('../models/panel-assignment.model');
const { createCrudHandlers } = require('./crud-handlers');
const handlers = createCrudHandlers(PanelAssignment, 'Panel assignment');
exports.getAssignments = handlers.list();
