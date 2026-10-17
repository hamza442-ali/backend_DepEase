const Deliverable = require('../models/deliverable.model');
const ProjectModule = require('../models/project-module.model');
const { HttpError } = require('../errors/http-error');
const { requireRecord } = require('../utils/records');

function moduleId(value) {
  return String(value._id ?? value);
}

async function addModule(deliverableId, projectModuleId) {
  const projectModule = await ProjectModule.findById(projectModuleId);
  const deliverable = requireRecord(await Deliverable.findById(deliverableId), 'Deliverable');
  if (!projectModule) throw new HttpError(404, 'Module not found');
  if (projectModule.projectId !== deliverable.projectId) {
    throw new HttpError(400, 'Module belongs to a different project');
  }

  const alreadyAdded = deliverable.modules.some(
    (value) => moduleId(value) === String(projectModule._id),
  );
  if (!alreadyAdded) {
    // Existing clients consume embedded module documents, not just reference IDs.
    deliverable.modules.push(projectModule.toObject());
    await deliverable.save();
  }
  return deliverable;
}

async function removeModule(deliverableId, projectModuleId) {
  const deliverable = requireRecord(await Deliverable.findById(deliverableId), 'Deliverable');
  deliverable.modules = deliverable.modules.filter((value) => moduleId(value) !== projectModuleId);
  await deliverable.save();
  return deliverable;
}

module.exports = { addModule, removeModule };
