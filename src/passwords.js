const { randomBytes, scrypt: scryptCallback, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const scrypt = promisify(scryptCallback);
const PREFIX = 'scrypt$';

async function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 8 || password.length > 1024) {
    throw Object.assign(new Error('Password must contain between 8 and 1024 characters'), { status: 400 });
  }
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64);
  return `${PREFIX}${salt}$${key.toString('hex')}`;
}

async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || password.length > 1024 || typeof stored !== 'string') return false;
  if (!stored.startsWith(PREFIX)) {
    const actual = Buffer.from(password);
    const expected = Buffer.from(stored);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }
  const [, salt, hex] = stored.split('$');
  if (!/^[a-f0-9]{32}$/.test(salt || '') || !/^[a-f0-9]{128}$/.test(hex || '')) return false;
  const actual = await scrypt(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(hex, 'hex'));
}

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
  for (const operation of ['updateOne', 'updateMany', 'findOneAndUpdate', 'replaceOne', 'findOneAndReplace']) {
    schema.pre(operation, function () {
      const update = this.getUpdate() || {};
      if (Array.isArray(update) || operation.includes('Replace') || operation === 'replaceOne') {
        throw Object.assign(new Error('Account replacement is not supported'), { status: 400 });
      }
      if ([update, ...Object.values(update)].some(value => value && typeof value === 'object' && Object.hasOwn(value, field))) {
        throw Object.assign(new Error('Password changes require saving an account document'), { status: 400 });
      }
    });
  }
}

module.exports = { hashPassword, verifyPassword, protectPassword, PREFIX };
