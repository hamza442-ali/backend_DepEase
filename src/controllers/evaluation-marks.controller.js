const EvaluationMarks = require('../models/evaluation-marks.model');
const { createCrudHandlers } = require('./crud-handlers');
const { asyncHandler } = require('../utils/async-handler');
const handlers = createCrudHandlers(EvaluationMarks, 'Marks');
const access = require('../services/project-access.service');
const { HttpError } = require('../errors/http-error');

exports.createMarks = handlers.create();
exports.listMarks = handlers.list();
exports.listProjectMarks = handlers.list((req) => ({ ProjectId: req.params.ProjectId }));
exports.updateProjectMarks = asyncHandler(async (req, res) => {
  await access.projectAccess(req, req.params.ProjectId, { write: true, review: true });
  const records = await EvaluationMarks.find({ ProjectId: req.params.ProjectId });
  if (records.length > 1)
    throw new HttpError(409, 'Multiple evaluations exist. Update the evaluation by record ID.');
  const existing = handlers.requireRecord(records[0]);
  const input = await access.prepareUpdate(EvaluationMarks, req, existing, req.body);
  res.json(
    await EvaluationMarks.findByIdAndUpdate(existing._id, input, {
      returnDocument: 'after',
      runValidators: true,
    }),
  );
});
exports.updateMarks = handlers.update();
exports.deleteMarks = asyncHandler(async (req, res) => {
  const record = await access.recordAccess(EvaluationMarks, req, req.params.id, true);
  await record.deleteOne();
  res.status(204).end();
});
