const Model = require('../model/addMarksModel');
const { crud } = require('../src/crud');
const { asyncHandler } = require('../src/http');
const handlers = crud(Model, 'Marks');

exports.createAddMarks = handlers.create();
exports.getAllAddMarks = handlers.list();
exports.getAddMarksByProjectId = handlers.list(req => ({ ProjectId: req.params.ProjectId }));
exports.updateAddMarks = asyncHandler(async (req, res) => {
  res.json(handlers.requireRecord(await Model.findOneAndUpdate({ ProjectId: req.params.ProjectId }, req.body, { new: true, runValidators: true })));
});
exports.deleteAddMarks = asyncHandler(async (req, res) => {
  handlers.requireRecord(await Model.findByIdAndDelete(req.params.id));
  res.status(204).end();
});
