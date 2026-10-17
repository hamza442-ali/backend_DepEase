const ScheduleSlot = require('../models/schedule-slot.model');
const { createCrudHandlers } = require('./crud-handlers');
const { asyncHandler } = require('../utils/async-handler');
const { HttpError } = require('../errors/http-error');
const handlers = createCrudHandlers(ScheduleSlot, 'Schedule');

const mongoose = require('mongoose');
const { dateRange } = require('../utils/validation');
exports.getAll = handlers.list();
exports.createSchedule = handlers.create((req) => {
  const body = req.body.data || req.body;
  dateRange(body.start, body.end);
  return body;
});
exports.updateSchedule = asyncHandler(async (req, res) => {
  const body = req.body.selectedSlot || req.body;
  const schedule = handlers.requireRecord(await ScheduleSlot.findById(req.params.id));
  dateRange(body.start ?? schedule.start.toISOString(), body.end ?? schedule.end.toISOString());
  for (const field of ['start', 'end', 'date', 'content', 'type', 'day']) {
    if (body[field] !== undefined) schedule[field] = body[field];
  }
  await schedule.save();
  res.json(schedule);
});
exports.deleteSchedule = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (
    !Array.isArray(ids) ||
    !ids.length ||
    ids.length > 500 ||
    ids.some((id) => !mongoose.isObjectIdOrHexString(id))
  ) {
    throw new HttpError(400, 'Provide a non-empty list of valid schedule IDs');
  }
  const result = await ScheduleSlot.deleteMany({ _id: { $in: ids } });
  res.json({ message: 'Slots deleted successfully', deletedCount: result.deletedCount });
});
