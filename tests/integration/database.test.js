const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { createApp } = require('../../src/app');
const { loadConfig } = require('../../src/config');
const { verifyPassword } = require('../../src/passwords');
const Student = require('../../model/studentModel');
const Teacher = require('../../model/teacherModel');

test('merged API works with MongoDB: accounts, legacy login upgrade, project modules, and missing records', async t => {
  const uri = process.env.TEST_MONGODB_URI;
  assert.ok(/^mongodb:\/\/(localhost|127\.0\.0\.1):\d+\/depease_test(?:\?directConnection=true)?$/.test(uri || ''),
    'Set TEST_MONGODB_URI to a local mongodb://127.0.0.1:27017/depease_test instance');
  const databaseName = `depease_test_${process.pid}`;
  await mongoose.connect(uri, { dbName: databaseName, serverSelectionTimeoutMS: 10000 });
  t.after(async () => {
    assert.equal(mongoose.connection.name, databaseName);
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });
  await Promise.all([Student.init(), Teacher.init()]);
  const config = loadConfig({ ATLAS_URI: uri, SECRET_KEY: 'database-test-secret-'.repeat(3), ADMIN_EMAILS: 'admin@example.com' });
  const server = createApp(config).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  async function request(path, { method = 'GET', body, token } = {}) {
    const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
    const text = await response.text();
    return { status: response.status, body: text ? JSON.parse(text) : undefined };
  }
  await Teacher.create({ name: 'Admin', employeeId: 'T1', email: 'admin@example.com', mobile: '123', Designation: 'Professor', passoword: 'admin password' });
  let login = await request('/loginT', { method: 'POST', body: { email: 'admin@example.com', password: 'admin password' } });
  assert.equal(login.status, 200);
  assert.equal(login.body.role, 'admin');
  assert.equal(login.body.teacher.passoword, undefined);
  const token = login.body.token;
  const studentData = { student_name: 'Student', email_address: 'student@example.com', password: 'student password',
    registration_number: 'S1', phone_number: '123', department: 'CS', batch: 2026, semester: 1 };
  const created = await request('/student/create', { method: 'POST', token, body: studentData });
  assert.equal(created.status, 201);
  assert.equal(created.body.password, undefined);
  const stored = await Student.findById(created.body._id).select('+password');
  assert.ok(stored.password.startsWith('scrypt$'));
  assert.equal(await verifyPassword(studentData.password, stored.password), true);
  assert.equal((await request('/student/create', { method: 'POST', token, body: studentData })).status, 409);

  // Seed an old database record directly to verify the plaintext migration path.
  await Student.collection.updateOne({ _id: stored._id }, { $set: { password: 'legacy password' } });
  login = await request('/login', { method: 'POST', body: { email_address: studentData.email_address, password: 'legacy password' } });
  assert.equal(login.status, 200);
  assert.equal(login.body.student.password, undefined);
  assert.ok((await Student.findById(stored._id).select('+password')).password.startsWith('scrypt$'));
  assert.equal((await request('/student/create', { method: 'POST', token: login.body.token, body: studentData })).status, 403);

  await Student.create([2, 3].map(id => ({ ...studentData, email_address: `student${id}@example.com`, registration_number: `S${id}` })));
  const group = await request('/group/add', { method: 'POST', token, body: { teamLeadId: 'S1', teammate1Id: 'S2', teammate2Id: 'S3' } });
  assert.equal(group.status, 201, JSON.stringify(group));
  const proposal = await require('../../src/models/proposal.model').create({ title: 'API', ProjectType: 'Development', supervisor: 'T1', problemStatement: 'Problem', problemSolution: 'Solution', scope: 'Scope', timeline: ['Now'], technologyUsed: 'Node', modules: ['API'] });
  const project = await request('/project/add', { method: 'POST', token, body: { ProjectId: 'P1', batch: 2026, semester: 1,
    teacher: 'T1', group: group.body._id, projectProposal: String(proposal._id) } });
  assert.equal(project.status, 201);
  assert.equal((await request('/projects/getall', { token })).body.length, 1);
  const module = await request('/modules/add', { method: 'POST', token, body: { projectId: 'P1', name: 'API', details: 'Build API' } });
  assert.equal(module.status, 201);
  assert.equal((await request(`/modules/update/${module.body._id}`, { method: 'PUT', token, body: { status: 'invalid' } })).status, 400);
  const panel = await request('/panel/createPanel', { method: 'POST', token, body: { id: 'panel-1', teachers: [{ employeeId: 'T1', panelHead: true }] } });
  assert.equal(panel.status, 201);
  assert.equal((await request('/panel/deletePanelbyID/missing', { method: 'DELETE', token })).status, 404);
  assert.equal((await request('/panel/getAllPanels', { token })).body.length, 1);
  assert.equal((await request('/teacher/update', { method: 'PUT', token, body: [{ employeeId: 'T1' }] })).status, 200);
  assert.equal((await request('/health/ready')).status, 200);
});
