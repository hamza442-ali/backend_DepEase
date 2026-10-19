const { asyncHandler } = require('../utils/async-handler');
const { requireRecord } = require('../utils/records');
const access = require('../services/project-access.service');

const requestBody = (req) => req.body;
const requestId = (req) => req.params.id;

function createCrudHandlers(model, label) {
  const ensureFound = (record) => requireRecord(record, label);

  function create(getData = requestBody) {
    return asyncHandler(async (req, res) => {
      const record = await model.create(await access.prepareCreate(model, req, await getData(req)));
      res.status(201).json(record);
    });
  }

  function list(getFilter = () => ({})) {
    return asyncHandler(async (req, res) => {
      res.json(await model.find(await access.filterCollection(model, req, await getFilter(req))));
    });
  }

  function get(getId = requestId) {
    return asyncHandler(async (req, res) => {
      res.json(await access.recordAccess(model, req, getId(req)));
    });
  }

  function update(getId = requestId, getData = requestBody) {
    return asyncHandler(async (req, res) => {
      const existing = await access.recordAccess(model, req, getId(req), true);
      const input = await access.prepareUpdate(model, req, existing, await getData(req));
      const record = await model.findByIdAndUpdate(existing._id, input, {
        returnDocument: 'after',
        runValidators: true,
      });
      res.json(ensureFound(record));
    });
  }

  function remove(getId = requestId) {
    return asyncHandler(async (req, res) => {
      const existing = await access.recordAccess(model, req, getId(req), true);
      if (model.modelName === 'Project') {
        const mongoose = require('mongoose');
        const Assignment = require('../models/panel-assignment.model');
        await mongoose.connection.transaction(async (session) => {
          await model.updateOne(
            { _id: existing._id, retiredAt: null },
            { $set: { retiredAt: new Date() } },
            { session },
          );
          await Assignment.updateMany(
            { studentIds: existing.ProjectId },
            { $pull: { studentIds: existing.ProjectId } },
            { session },
          );
        });
        return res.json({
          message: 'Project archived. Its identifier remains reserved to protect retained records.',
        });
      }
      if (model.modelName === 'Group' || model.modelName === 'Proposal') {
        const Project = require('../models/project.model');
        const field = model.modelName === 'Group' ? 'group' : 'projectProposal';
        if (await Project.exists({ [field]: String(existing._id) })) {
          const { HttpError } = require('../errors/http-error');
          throw new HttpError(409, 'Remove the linked project before deleting this record');
        }
      }
      await existing.deleteOne();
      res.json({ message: `${label} deleted successfully` });
    });
  }

  return { create, list, get, update, remove, requireRecord: ensureFound };
}

module.exports = { createCrudHandlers };
