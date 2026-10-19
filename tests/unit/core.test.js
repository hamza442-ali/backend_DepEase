const test = require('node:test');
const assert = require('node:assert/strict');
const { loadConfig } = require('../../src/config');
const { hashPassword, verifyPassword } = require('../../src/passwords');
const { validateInput, errorHandler, asyncHandler } = require('../../src/http');
const { arrayValue, dateRange, jobName } = require('../../src/validation');
const { rateLimit } = require('../../src/rate-limit');
const { crud } = require('../../src/crud');

const config = { ATLAS_URI: 'mongodb://127.0.0.1/test', SECRET_KEY: 'a'.repeat(32) };
const response = () => ({
  statusCode: 200, headers: {},
  status(code) { this.statusCode = code; return this; },
  json(value) { this.body = value; return this; },
  set(key, value) { this.headers[key] = value; return this; },
});

test('configuration fails early for invalid secrets, MongoDB URLs, ports and CORS origins', () => {
  for (const invalid of [{ SECRET_KEY: '' }, { ATLAS_URI: 'https://example.com' }, { PORT: 'NaN' }, { PORT: '65536' }, { CORS_ORIGINS: '*' }]) {
    assert.throws(() => loadConfig({ ...config, ...invalid }));
  }
  assert.equal(loadConfig(config).port, 3001);
  assert.deepEqual(loadConfig({ ...config, ADMIN_EMAILS: ' Admin@Example.com, ' }).adminEmails, ['admin@example.com']);
});

test('password hashes have distinct salts, verify correctly and never equal the supplied password', async () => {
  const first = await hashPassword('correct password');
  const second = await hashPassword('correct password');
  assert.notEqual(first, second);
  assert.notEqual(first, 'correct password');
  assert.equal(await verifyPassword('correct password', first), true);
  assert.equal(await verifyPassword('incorrect password', first), false);
  assert.equal(await verifyPassword('legacy password', 'legacy password'), true);
  assert.equal(await verifyPassword('wrong', 'legacy password'), false);
  assert.equal(await verifyPassword({ $ne: null }, first), false);
  assert.equal(await verifyPassword('test', 'scrypt$malformed$hash'), false);
  await assert.rejects(hashPassword('short'));
});

test('input validation rejects nested query operators and prototype keys', () => {
  for (const body of [{ email: { $ne: null } }, { list: [{ 'a.b': 1 }] }, JSON.parse('{"__proto__": {"admin": true}}')]) {
    validateInput({ body, query: {} }, {}, error => assert.equal(error.status, 400));
  }
  validateInput({ body: { title: 'Normal', list: [1, 2] }, query: {} }, {}, error => assert.equal(error, undefined));
});

test('errors map duplicate and invalid records and redact internal details', () => {
  for (const [error, expected] of [[{ code: 11000 }, 409], [{ name: 'ValidationError' }, 400], [{ code: 'LIMIT_FILE_SIZE' }, 413], [new Error('private connection string'), 500]]) {
    const res = response();
    errorHandler(error, {}, res, () => {});
    assert.equal(res.statusCode, expected);
    assert.ok(!res.body.error.includes('private'));
  }
});

test('async handlers forward both synchronous throws and rejected promises', async () => {
  const error = new Error('test');
  for (const handler of [() => { throw error; }, () => Promise.reject(error)]) {
    let forwarded;
    await asyncHandler(handler)({}, {}, value => { forwarded = value; });
    assert.equal(forwarded, error);
  }
});

test('legacy JSON-string arrays and modern arrays are accepted; malformed values fail', () => {
  assert.deepEqual(arrayValue('["one"]', 'assignedTo'), ['one']);
  assert.deepEqual(arrayValue(['one'], 'assignedTo'), ['one']);
  assert.throws(() => arrayValue('{', 'assignedTo'));
  assert.throws(() => arrayValue('{}', 'assignedTo'));
  assert.throws(() => dateRange('bad date', 'also bad'));
  assert.throws(() => dateRange('2026-10-18', '2026-10-17'));
  assert.doesNotThrow(() => dateRange('2026-10-17', '2026-10-18'));
  assert.throws(() => jobName('../other-job'));
});

test('login throttling isolates clients and resets after the time window', () => {
  let time = 1000;
  const limit = rateLimit({ windowMs: 1000, limit: 2, now: () => time });
  let allowed = 0;
  const next = () => allowed++;
  limit({ ip: 'one' }, response(), next);
  limit({ ip: 'one' }, response(), next);
  const blocked = response();
  limit({ ip: 'one' }, blocked, next);
  assert.equal(blocked.statusCode, 429);
  assert.equal(blocked.headers['Retry-After'], '1');
  limit({ ip: 'two' }, response(), next);
  time = 2001;
  limit({ ip: 'one' }, response(), next);
  assert.equal(allowed, 4);
});

test('deleting a missing record returns 404; database failures reach error middleware', async () => {
  let forwarded;
  await crud({ findById: async () => null }, 'Task').remove()({ params: { id: 'missing' } }, response(), error => { forwarded = error; });
  assert.equal(forwarded.status, 404);
  const databaseError = new Error('database offline');
  await crud({ find: async () => { throw databaseError; } }, 'Task').list()({}, response(), error => { forwarded = error; });
  assert.equal(forwarded, databaseError);
});
