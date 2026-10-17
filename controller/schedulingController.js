const Model = require('../model/schedulingModel');
const { crud } = require('../src/crud');
const { asyncHandler, HttpError } = require('../src/http');
const handlers = crud(Model, 'Schedule');

const mongoose = require('mongoose');
const { dateRange } = require('../src/validation');
exports.getAll = handlers.list();
exports.createSchedule = handlers.create(req => {
  const body = req.body.data || req.body;
  dateRange(body.start, body.end);
  return body;
});
exports.updateSchedule = asyncHandler(async (req, res) => {
  const body = req.body.selectedSlot || req.body;
  const schedule = handlers.requireRecord(await Model.findById(req.params.id));
  dateRange(body.start ?? schedule.start.toISOString(), body.end ?? schedule.end.toISOString());
  for (const field of ['start', 'end', 'date', 'content', 'type', 'day']) {
    if (body[field] !== undefined) schedule[field] = body[field];
  }
  await schedule.save();
  res.json(schedule);
});
exports.deleteSchedule = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || !ids.length || ids.length > 500 || ids.some(id => !mongoose.isObjectIdOrHexString(id))) {
    throw new HttpError(400, 'Provide a non-empty list of valid schedule IDs');
  }
  const result = await Model.deleteMany({ _id: { $in: ids } });
  res.json({ message: 'Slots deleted successfully', deletedCount: result.deletedCount });
});
