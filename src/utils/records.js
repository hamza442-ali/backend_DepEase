const { HttpError } = require('../errors/http-error');

function requireRecord(record, label) {
  if (!record) throw new HttpError(404, `${label} not found`);
  return record;
}

function requireDeletion(result, label) {
  if (!result.deletedCount) throw new HttpError(404, `${label} not found`);
  return result;
}

function pickFields(source, fields) {
  return Object.fromEntries(fields.map((field) => [field, source[field]]));
}

function assignDefinedFields(record, source, fields) {
  for (const field of fields) {
    if (source[field] !== undefined) record[field] = source[field];
  }
}

module.exports = { requireRecord, requireDeletion, pickFields, assignDefinedFields };
