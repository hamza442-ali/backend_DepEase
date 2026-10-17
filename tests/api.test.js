const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { createApp } = require('../src/app');
const { loadConfig } = require('../src/config');
const config = loadConfig({ ATLAS_URI: 'mongodb://127.0.0.1/test', SECRET_KEY: 'test-secret-'.repeat(4), ADMIN_EMAILS: 'admin@example.com' });

test('all models and route modules load together without collisions', () => {
  for (const directory of ['model', 'models', 'routes']) {
    for (const filename of fs.readdirSync(directory).filter(name => name.endsWith('.js'))) require(`../${directory}/${filename}`);
  }
  assert.equal(require('../models/studentModel'), require('../model/studentModel'));
  assert.equal(require('../models/createPanelModel'), require('../model/fypPanelModel'));
});

test('HTTP compatibility, health, validation and access controls work without opening a database', async t => {
  const server = createApp(config).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  async function request(path, body, token) {
    return fetch(base + path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }
  const token = role => jwt.sign({ role, email: 'user@example.com' }, config.secretKey,
    { algorithm: 'HS256', subject: new mongoose.Types.ObjectId().toString(), issuer: 'depease', audience: 'depease-api', expiresIn: '1h' });
  assert.equal(await (await request('/')).text(), 'welcome');
  assert.equal((await request('/health/live')).status, 200);
  assert.equal((await request('/health/ready')).status, 503);
  for (const path of ['/projects/getall', '/project/getall', '/student/getAllStudents', '/jenkins/getDeploymentLink', '/scheduler/scheduler']) {
    assert.equal((await request(path)).status, 401, path);
  }
  assert.equal((await request('/student/create', {}, token('student'))).status, 403);
  assert.equal((await request('/panel/getAllPanels', undefined, token('student'))).status, 403);
  assert.equal((await request('/jenkins/createPipelineJob', {}, token('student'))).status, 403);
  assert.equal((await request('/schedule/create', {}, token('student'))).status, 403);
  assert.equal((await request('/announcementS/add', {}, token('student'))).status, 403);
  assert.equal((await request('/login', { email_address: { $ne: null }, password: 'anything' })).status, 400);
  assert.equal((await request('/login', {})).status, 400);
  assert.equal((await request('/loginT', { email: 'valid@example.com' })).status, 400);
  assert.equal((await request('/missing')).status, 404);
  const expired = jwt.sign({ role: 'teacher' }, config.secretKey, { expiresIn: -1 });
  assert.equal((await request('/tasks/getall', undefined, expired)).status, 401);
  assert.equal((await request('/tasks/getall', undefined, token('admin'))).status, 401);
});

test('account JSON redacts explicitly selected passwords', () => {
  const Student = require('../model/studentModel');
  const Teacher = require('../model/teacherModel');
  assert.equal(new Student({ password: 'private' }).toJSON().password, undefined);
  assert.equal(new Teacher({ passoword: 'private' }).toJSON().passoword, undefined);
});
