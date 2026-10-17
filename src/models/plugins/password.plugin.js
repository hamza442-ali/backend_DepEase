const { HttpError } = require('../../errors/http-error');
const { hashPassword } = require('../../security/passwords');

function protectPassword(schema, field) {
  schema.path(field).select(false);
  const stripPassword = (doc, value) => {
    delete value[field];
    return value;
  };
  schema.set('toJSON', { transform: stripPassword });
  schema.set('toObject', { transform: stripPassword });
  schema.pre('save', async function () {
    if (this.isModified(field)) this[field] = await hashPassword(this[field]);
  });
  // Password changes use document.save() to run the hashing and validation hooks.
  for (const operation of [
    'updateOne',
    'updateMany',
    'findOneAndUpdate',
    'replaceOne',
    'findOneAndReplace',
  ]) {
    schema.pre(operation, function () {
      const update = this.getUpdate() || {};
      if (Array.isArray(update) || operation.includes('Replace') || operation === 'replaceOne') {
        throw new HttpError(400, 'Account replacement is not supported');
      }
      if (
        [update, ...Object.values(update)].some(
          (value) => value && typeof value === 'object' && Object.hasOwn(value, field),
        )
      ) {
        throw new HttpError(400, 'Password changes require saving an account document');
      }
    });
  }
}

module.exports = { protectPassword };
