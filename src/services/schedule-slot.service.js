const { isObjectIdOrHexString } = require('mongoose');
const ScheduleSlot = require('../models/schedule-slot.model');
const { HttpError } = require('../errors/http-error');
const { dateRange } = require('../utils/validation');
const { requireRecord, assignDefinedFields } = require('../utils/records');

const SCHEDULE_FIELDS = ['start', 'end', 'date', 'content', 'type', 'day'];

function prepareSchedule(input) {
  dateRange(input.start, input.end);
  return input;
}

async function updateSchedule(id, input) {
  const schedule = requireRecord(await ScheduleSlot.findById(id), 'Schedule');
  dateRange(input.start ?? schedule.start.toISOString(), input.end ?? schedule.end.toISOString());
  assignDefinedFields(schedule, input, SCHEDULE_FIELDS);
  return schedule.save();
}

async function deleteSchedules(ids) {
  if (
    !Array.isArray(ids) ||
    !ids.length ||
    ids.length > 500 ||
    ids.some((id) => !isObjectIdOrHexString(id))
  ) {
    throw new HttpError(400, 'Provide a non-empty list of valid schedule IDs');
  }
  const result = await ScheduleSlot.deleteMany({ _id: { $in: ids } });
  return result.deletedCount;
}

module.exports = { prepareSchedule, updateSchedule, deleteSchedules };
