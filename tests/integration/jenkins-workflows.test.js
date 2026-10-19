const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const mongoose = require('mongoose');
const { createApp } = require('../../src/app');
const { loadConfig } = require('../../src/config');
const { createAccessToken } = require('../../src/security/tokens');
const Pipeline = require('../../src/models/pipeline.model');
const Build = require('../../src/models/pipeline-build.model');

test('durable asynchronous Jenkins workflows over the authenticated HTTP boundary', async (t) => {
  const uri = process.env.TEST_MONGODB_URI;
  assert.match(
    uri || '',
    /^mongodb:\/\/(localhost|127\.0\.0\.1):\d+\/depease_test(?:\?directConnection=true)?$/,
  );
  const dbName = `depease_jenkins_${process.pid}`;
  await mongoose.connect(uri, { dbName });
  t.after(async () => {
    assert.equal(mongoose.connection.name, dbName);
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });
  let offline = false;
  let failCreate = true;
  let starts = 0;
  let queueId = 0;
  const states = new Map();
  const calls = [];
  const bridge = http
    .createServer(async (req, res) => {
      let raw = '';
      for await (const chunk of req) raw += chunk;
      const data = raw ? JSON.parse(raw) : {};
      calls.push({ path: req.url, method: req.method, data });
      res.setHeader('Content-Type', 'application/json');
      assert.equal(req.headers['x-bridge-token'], 'bridge-test-token-'.repeat(3));
      if (offline || (req.url === '/create_job' && failCreate)) {
        res.statusCode = 503;
        return res.end(JSON.stringify({ error: 'Unavailable' }));
      }
      if (req.url === '/connection')
        return res.end(
          JSON.stringify({ connected: true, availableExecutors: 1, message: 'Connected' }),
        );
      if (req.url === '/create_job') return res.end(JSON.stringify({ message: 'Job ready' }));
      if (req.url === '/start_build') {
        starts++;
        states.set(data.request_id, { status: 'QUEUED', queueId: ++queueId });
        res.statusCode = 202;
        return res.end(JSON.stringify(states.get(data.request_id)));
      }
      if (req.url === '/build_status') return res.end(JSON.stringify(states.get(data.request_id)));
      if (req.url === '/cancel_build') {
        const state = { ...states.get(data.request_id), status: 'ABORTED', cancelRequested: false };
        states.set(data.request_id, state);
        return res.end(JSON.stringify(state));
      }
      if (req.url === '/delete_pipeline') return res.end(JSON.stringify({ message: 'Removed' }));
      res.statusCode = 404;
      res.end('{}');
    })
    .listen(0, '127.0.0.1');
  await new Promise((resolve) => bridge.once('listening', resolve));
  t.after(() => new Promise((resolve) => bridge.close(resolve)));
  const previous = Object.fromEntries(
    ['JENKINS_BRIDGE_URL', 'JENKINS_BRIDGE_TOKEN', 'JENKINS_PUBLIC_URL'].map((key) => [
      key,
      process.env[key],
    ]),
  );
  Object.assign(process.env, {
    JENKINS_BRIDGE_URL: `http://127.0.0.1:${bridge.address().port}`,
    JENKINS_BRIDGE_TOKEN: 'bridge-test-token-'.repeat(3),
    JENKINS_PUBLIC_URL: 'http://localhost:8082',
  });
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  const config = loadConfig({
    ATLAS_URI: uri,
    SECRET_KEY: 'jenkins-test-secret-'.repeat(3),
    ADMIN_EMAILS: 'admin@hamza.com',
  });
  const server = createApp(config).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
  const Teacher = mongoose.model('Teacher');
  const staff = await Teacher.create(
    ['admin', 'supervisor', 'outsider', 'panel'].map((name, index) => ({
      name,
      employeeId: `T${index}`,
      email: index ? `${name}@depease.test` : 'admin@hamza.com',
      mobile: '123',
      Designation: 'Lecturer',
      passoword: 'Jenkins test password!',
    })),
  );
  const [admin, supervisor, outsider, panel] = staff.map((account, index) =>
    createAccessToken(account._id, index ? 'teacher' : 'admin', account.email, config),
  );
  const student = await mongoose
    .model('Student')
    .create({
      student_name: 'Student',
      registration_number: 'S1',
      email_address: 'student@depease.test',
      password: 'Jenkins test password!',
      phone_number: '123',
      department: 'CS',
      batch: 2026,
      semester: 7,
    });
  const studentToken = createAccessToken(student._id, 'student', student.email_address, config);
  const project = await mongoose
    .model('Project')
    .create({
      ProjectId: 'JENKINS-P1',
      group: 'group1',
      projectProposal: 'proposal1',
      teacher: 'T1',
      batch: 2026,
      semester: 7,
    });
  await mongoose
    .model('Project')
    .create({
      ProjectId: 'JENKINS-P2',
      group: 'group2',
      projectProposal: 'proposal2',
      teacher: 'T2',
      batch: 2026,
      semester: 7,
    });
  await mongoose
    .model('Panel')
    .create({ id: 'JPANEL', teachers: [{ employeeId: 'T3', name: 'Panel', panelHead: true }] });
  await mongoose.model('AssignmentPanel').create({ panelId: 'JPANEL', studentIds: ['JENKINS-P1'] });
  async function request(path, token, body, method = body === undefined ? 'GET' : 'POST') {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, data: await response.json() };
  }
  function expect(result, status) {
    assert.equal(result.status, status, JSON.stringify(result.data));
    return result.data;
  }
  const input = {
    ProjectId: 'JENKINS-P1',
    Type: 'Frontend',
    githubLink: 'https://github.com/example/application',
    selectedTool: 'ReactJs',
    branch: 'feature/ui',
    scriptPath: '.ci/Jenkinsfile',
  };
  let pipeline;
  let build;
  const requestId = 'stable-request-000000001';

  await t.test(
    'connection checks preserve user sessions and report unavailable services',
    async () => {
      expect(await request('/jenkins/status'), 401);
      expect(await request('/jenkins/status', studentToken), 403);
      assert.equal(expect(await request('/jenkins/status', admin), 200).connected, true);
      offline = true;
      assert.equal(expect(await request('/jenkins/status', admin), 200).connected, false);
      offline = false;
    },
  );
  await t.test(
    'configuration failures are visible and setup retries reuse the same owned job',
    async () => {
      pipeline = expect(await request('/jenkins/createPipelineJob', supervisor, input), 200);
      assert.equal(pipeline.state, 'ERROR');
      assert.equal(pipeline.job_name, `depease-${project._id}-frontend`);
      failCreate = false;
      const retried = expect(await request('/jenkins/createPipelineJob', supervisor, input), 200);
      assert.equal(retried._id, pipeline._id);
      assert.equal(retried.state, 'READY');
      assert.equal(await Pipeline.countDocuments(), 1);
      assert.equal(
        calls.filter((call) => call.path === '/create_job')[1].data.owner_id,
        pipeline._id,
      );
      expect(
        await request('/jenkins/createPipelineJob', supervisor, { ...input, branch: '../private' }),
        400,
      );
      expect(
        await request('/jenkins/createPipelineJob', supervisor, {
          ...input,
          scriptPath: '../Jenkinsfile',
        }),
        400,
      );
      expect(await request('/jenkins/createPipelineJob', outsider, input), 403);
    },
  );
  await t.test(
    'concurrent requests queue exactly one build and active deletion is blocked',
    async () => {
      const result = await Promise.all([
        request('/jenkins/buildPipline', supervisor, { job_name: pipeline.job_name, requestId }),
        request('/jenkins/buildPipline', supervisor, {
          job_name: pipeline.job_name,
          requestId: 'other-request-000000001',
        }),
      ]);
      result.forEach((item) => expect(item, 202));
      build = result[0].data;
      assert.equal(result[0].data._id, result[1].data._id);
      assert.equal(starts, 1);
      // Use the winner's key: scheduling order is intentionally unspecified.
      assert.equal(
        expect(
          await request('/jenkins/buildPipline', supervisor, {
            job_name: pipeline.job_name,
            requestId: build.requestId,
          }),
          202,
        )._id,
        build._id,
      );
      expect(
        await request(
          `/jenkins/deletePipline?ProjectId=JENKINS-P1&job_name=${pipeline.job_name}`,
          supervisor,
          undefined,
          'DELETE',
        ),
        409,
      );
      assert.equal(
        calls.some((call) => call.path === '/build_pipeline'),
        false,
      );
    },
  );
  await t.test(
    'outages retain progress, long builds resume and successful links are recorded',
    async () => {
      const refresh = async () => {
        await Build.updateOne({ _id: build._id }, { $unset: { checkedAt: 1 } });
        return expect(
          await request('/jenkins/getDeploymentLink', supervisor, {
            ProjectId: 'JENKINS-P1',
            Type: 'Frontend',
          }),
          200,
        );
      };
      offline = true;
      let detail = await refresh();
      assert.equal(detail.builds[0].status, 'QUEUED');
      assert.match(detail.builds[0].message, /temporarily unavailable/);
      offline = false;
      states.set(build._id, {
        status: 'RUNNING',
        queueId: build.queueId,
        buildNumber: 7,
        startedAt: Date.now(),
      });
      detail = await refresh();
      assert.equal(detail.builds[0].status, 'RUNNING');
      assert.equal(detail.builds[0].buildNumber, 7);
      states.set(build._id, {
        status: 'SUCCESS',
        queueId: build.queueId,
        buildNumber: 7,
        durationMs: 123000,
        deploymentLink: 'https://depease.example.test',
      });
      detail = await refresh();
      assert.equal(detail.builds[0].active, false);
      assert.equal(detail.deploymentLink, 'https://depease.example.test/');
      assert.match(detail.jobUrl, /localhost:8082\/job\//);
      offline = true;
      detail = await refresh();
      assert.equal(detail.builds[0].status, 'SUCCESS');
      offline = false;
      expect(
        await request('/jenkins/buildPipline', supervisor, {
          job_name: pipeline.job_name,
          requestId: build.requestId,
        }),
        200,
      );
      assert.equal(starts, 1);
    },
  );
  await t.test(
    'history and cancellation are project scoped, and cancelled runs stay in history',
    async () => {
      expect(await request(`/jenkins/pipelines/${pipeline._id}/builds`, outsider), 403);
      expect(await request(`/jenkins/pipelines/${pipeline._id}/builds`, panel), 200);
      expect(
        await request(`/jenkins/pipelines/${pipeline._id}/builds/${build._id}/cancel`, panel, {}),
        403,
      );
      const next = expect(
        await request('/jenkins/buildPipline', supervisor, {
          job_name: pipeline.job_name,
          requestId: 'cancel-request-0000001',
        }),
        202,
      );
      const cancelled = expect(
        await request(
          `/jenkins/pipelines/${pipeline._id}/builds/${next._id}/cancel`,
          supervisor,
          {},
        ),
        202,
      );
      assert.equal(cancelled.status, 'ABORTED');
      assert.equal(cancelled.active, false);
      assert.equal((await Build.findById(next._id)).status, 'ABORTED');
      expect(
        await request(
          `/jenkins/deletePipline?ProjectId=JENKINS-P1&job_name=${pipeline.job_name}`,
          supervisor,
          undefined,
          'DELETE',
        ),
        200,
      );
      assert.equal(await Pipeline.countDocuments(), 0);
      assert.equal(await Build.countDocuments(), 0);
      const deletion = calls.find((call) => call.path === '/delete_pipeline');
      assert.equal(deletion.data.owner_id, pipeline._id);
    },
  );
});
