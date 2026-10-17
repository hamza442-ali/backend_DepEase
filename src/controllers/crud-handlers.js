const { asyncHandler } = require('../utils/async-handler');
const { requireRecord } = require('../utils/records');

const requestBody = (req) => req.body;
const requestId = (req) => req.params.id;

function createCrudHandlers(model, label) {
  const ensureFound = (record) => requireRecord(record, label);

  function create(getData = requestBody) {
    return asyncHandler(async (req, res) => {
      const record = await model.create(getData(req));
      res.status(201).json(record);
    });
  }

  function list(getFilter = () => ({})) {
    return asyncHandler(async (req, res) => {
      res.json(await model.find(getFilter(req)));
    });
  }

  function get(getId = requestId) {
    return asyncHandler(async (req, res) => {
      res.json(ensureFound(await model.findById(getId(req))));
    });
  }

  function update(getId = requestId, getData = requestBody) {
    return asyncHandler(async (req, res) => {
      const record = await model.findByIdAndUpdate(getId(req), getData(req), {
        new: true,
        runValidators: true,
      });
      res.json(ensureFound(record));
    });
  }

  function remove(getId = requestId) {
    return asyncHandler(async (req, res) => {
      ensureFound(await model.findByIdAndDelete(getId(req)));
      res.json({ message: `${label} deleted successfully` });
    });
  }

  return { create, list, get, update, remove, requireRecord: ensureFound };
}

module.exports = { createCrudHandlers };
