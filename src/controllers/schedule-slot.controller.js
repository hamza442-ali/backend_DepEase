const ScheduleSlot = require('../models/schedule-slot.model');
const schedules = require('../services/schedule-slot.service');
const { createCrudHandlers } = require('./crud-handlers');
const { asyncHandler } = require('../utils/async-handler');

const handlers = createCrudHandlers(ScheduleSlot, 'Schedule');
exports.getAll = handlers.list();
exports.createSchedule = handlers.create((req) =>
  schedules.prepareSchedule(req.body.data || req.body),
);
exports.updateSchedule = asyncHandler(async (req, res) => {
  res.json(await schedules.updateSchedule(req.params.id, req.body.selectedSlot || req.body));
});
exports.deleteSchedule = asyncHandler(async (req, res) => {
  const deletedCount = await schedules.deleteSchedules(req.body.ids);
  res.json({ message: 'Slots deleted successfully', deletedCount });
});
