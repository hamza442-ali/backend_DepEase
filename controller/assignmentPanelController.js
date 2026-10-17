const Model = require('../model/panelAssignmentModel');
const { crud } = require('../src/crud');
const handlers = crud(Model, 'Panel assignment');
exports.getAssignments = handlers.list();
