const EvaluationMarks = require('../models/evaluation-marks.model');
const { createCrudHandlers } = require('./crud-handlers');
const { asyncHandler } = require('../utils/async-handler');
const handlers = createCrudHandlers(EvaluationMarks, 'Marks');

exports.createAddMarks = handlers.create();
exports.getAllAddMarks = handlers.list();
exports.getAddMarksByProjectId = handlers.list((req) => ({ ProjectId: req.params.ProjectId }));
exports.updateAddMarks = asyncHandler(async (req, res) => {
  res.json(
    handlers.requireRecord(
      await EvaluationMarks.findOneAndUpdate({ ProjectId: req.params.ProjectId }, req.body, {
        new: true,
        runValidators: true,
      }),
    ),
  );
});
exports.deleteAddMarks = asyncHandler(async (req, res) => {
  handlers.requireRecord(await EvaluationMarks.findByIdAndDelete(req.params.id));
  res.status(204).end();
});
