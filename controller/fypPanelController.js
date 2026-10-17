const Model = require('../model/fypPanelModel');
const { crud } = require('../src/crud');
const handlers = crud(Model, 'Panel');
exports.getAllPanelsByTeacherId = handlers.list(req => ({ 'teachers.employeeId': req.params.teacherId }));
