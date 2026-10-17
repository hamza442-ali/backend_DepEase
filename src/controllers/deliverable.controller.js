const Deliverable = require('../models/deliverable.model');
const deliverables = require('../services/deliverable.service');
const { createCrudHandlers } = require('./crud-handlers');
const { asyncHandler } = require('../utils/async-handler');

const handlers = createCrudHandlers(Deliverable, 'Deliverable');
exports.createDeliverable = handlers.create();
exports.getDeliverables = handlers.list();
exports.getDeliverableById = handlers.list((req) => ({ projectId: req.params.projectId }));
exports.updateDeliverable = handlers.update();
exports.deleteDeliverable = handlers.remove();
exports.addModuleToDeliverable = asyncHandler(async (req, res) => {
  res.json(await deliverables.addModule(req.body.deliverableId, req.body.moduleId));
});
exports.removeModuleFromDeliverable = asyncHandler(async (req, res) => {
  res.json(await deliverables.removeModule(req.params.deliverableId, req.params.moduleId));
});
