const Deliverable = require('../models/deliverable.model');
const { createCrudHandlers } = require('./crud-handlers');
const { asyncHandler } = require('../utils/async-handler');
const { HttpError } = require('../errors/http-error');
const handlers = createCrudHandlers(Deliverable, 'Deliverable');

const Module = require('../models/project-module.model');
exports.createDeliverable = handlers.create();
exports.getDeliverables = handlers.list();
exports.getDeliverableById = handlers.list((req) => ({ projectId: req.params.projectId }));
exports.updateDeliverable = handlers.update();
exports.deleteDeliverable = handlers.remove();
exports.addModuleToDeliverable = asyncHandler(async (req, res) => {
  const { moduleId, deliverableId } = req.body;
  const module = await Module.findById(moduleId);
  const deliverable = handlers.requireRecord(await Deliverable.findById(deliverableId));
  if (!module) throw new HttpError(404, 'Module not found');
  if (module.projectId !== deliverable.projectId)
    throw new HttpError(400, 'Module belongs to a different project');
  const hasModule = deliverable.modules.some(
    (value) => String(value._id ?? value) === String(module._id),
  );
  if (!hasModule) {
    // Preserve the embedded module format used by the existing clients.
    deliverable.modules.push(module.toObject());
    await deliverable.save();
  }
  res.json(deliverable);
});
exports.removeModuleFromDeliverable = asyncHandler(async (req, res) => {
  const deliverable = handlers.requireRecord(await Deliverable.findById(req.params.deliverableId));
  deliverable.modules = deliverable.modules.filter(
    (value) => String(value._id ?? value) !== req.params.moduleId,
  );
  await deliverable.save();
  res.json(deliverable);
});
