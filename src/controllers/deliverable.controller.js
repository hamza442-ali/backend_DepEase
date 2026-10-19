const Deliverable = require('../models/deliverable.model');
const deliverables = require('../services/deliverable.service');
const { createCrudHandlers } = require('./crud-handlers');
const { asyncHandler } = require('../utils/async-handler');
const { recordAccess } = require('../services/project-access.service');
const ProjectModule = require('../models/project-module.model');

const handlers = createCrudHandlers(Deliverable, 'Deliverable');
exports.createDeliverable = handlers.create();
exports.getDeliverables = handlers.list();
exports.listProjectDeliverables = handlers.list((req) => ({ projectId: req.params.projectId }));
exports.updateDeliverable = handlers.update();
exports.deleteDeliverable = handlers.remove();
exports.addModuleToDeliverable = asyncHandler(async (req, res) => {
  await recordAccess(Deliverable, req, req.body.deliverableId, true);
  await recordAccess(ProjectModule, req, req.body.moduleId, true);
  res.json(await deliverables.addModule(req.body.deliverableId, req.body.moduleId));
});
exports.removeModuleFromDeliverable = asyncHandler(async (req, res) => {
  await recordAccess(Deliverable, req, req.params.deliverableId, true);
  res.json(await deliverables.removeModule(req.params.deliverableId, req.params.moduleId));
});
