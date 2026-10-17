const { asyncHandler } = require('../utils/async-handler');
const { HttpError } = require('../errors/http-error');

function createCrudHandlers(Model, label) {
  const requireRecord = (record) => {
    if (!record) throw new HttpError(404, `${label} not found`);
    return record;
  };
  return {
    create: (body = (req) => req.body) =>
      asyncHandler(async (req, res) => {
        res.status(201).json(await Model.create(body(req)));
      }),
    list: (filter = () => ({})) =>
      asyncHandler(async (req, res) => res.json(await Model.find(filter(req)))),
    get: (id = (req) => req.params.id) =>
      asyncHandler(async (req, res) => {
        res.json(requireRecord(await Model.findById(id(req))));
      }),
    update: (id = (req) => req.params.id, body = (req) => req.body) =>
      asyncHandler(async (req, res) => {
        res.json(
          requireRecord(
            await Model.findByIdAndUpdate(id(req), body(req), { new: true, runValidators: true }),
          ),
        );
      }),
    remove: (id = (req) => req.params.id) =>
      asyncHandler(async (req, res) => {
        requireRecord(await Model.findByIdAndDelete(id(req)));
        res.json({ message: `${label} deleted successfully` });
      }),
    requireRecord,
  };
}

module.exports = { createCrudHandlers, crud: createCrudHandlers };
