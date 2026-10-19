const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const mongoose = require('mongoose');
const { createApp } = require('../../src/app');
const { loadConfig } = require('../../src/config');
const { createAccessToken } = require('../../src/security/tokens');
const Student = require('../../src/models/student.model');
const Teacher = require('../../src/models/teacher.model');
const Project = require('../../src/models/project.model');
const Proposal = require('../../src/models/proposal.model');
const Group = require('../../src/models/group.model');
const Panel = require('../../src/models/panel.model');
const Assignment = require('../../src/models/panel-assignment.model');
const Requirement = require('../../src/models/requirement.model');
const Task = require('../../src/models/task.model');
const Pipeline = require('../../src/models/pipeline.model');

test('project boundaries and complete local collaboration workflows', async (t) => {
  const uri = process.env.TEST_MONGODB_URI;
  assert.match(
    uri || '',
    /^mongodb:\/\/(localhost|127\.0\.0\.1):\d+\/depease_test(?:\?directConnection=true)?$/,
  );
  const databaseName = `depease_boundaries_${process.pid}`;
  const uploadDir = await fs.mkdtemp(path.join(os.tmpdir(), 'depease-uploads-'));
  const previous = {
    UPLOAD_DIR: process.env.UPLOAD_DIR,
    DOCUMENT_STORAGE: process.env.DOCUMENT_STORAGE,
  };
  process.env.UPLOAD_DIR = uploadDir;
  process.env.DOCUMENT_STORAGE = 'local';
  for (const key of ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM']) {
    previous[key] = process.env[key];
    delete process.env[key];
  }
  await mongoose.connect(uri, { dbName: databaseName, serverSelectionTimeoutMS: 10000 });
  t.after(async () => {
    assert.equal(mongoose.connection.name, databaseName);
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await fs.rm(uploadDir, { recursive: true, force: true });
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  const config = loadConfig({
    ATLAS_URI: uri,
    SECRET_KEY: 'boundary-test-secret-'.repeat(3),
    ADMIN_EMAILS: 'admin@depease.test',
  });
  const server = createApp(config).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
  const base = `http://127.0.0.1:${server.address().port}`;
  async function request(route, token, body, method = body === undefined ? 'GET' : 'POST') {
    const response = await fetch(base + route, {
      method,
      headers: {
        ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    });
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { status: response.status, data, headers: response.headers };
  }
  function expect(response, status) {
    assert.equal(response.status, status, JSON.stringify(response.data));
    return response.data;
  }
  const staff = await Teacher.create(
    ['admin', 'supervisor', 'panel', 'outsider'].map((name, i) => ({
      name,
      employeeId: `T${i}`,
      email: `${name}@depease.test`,
      mobile: '123',
      Designation: 'Lecturer',
      passoword: 'Test password 2026!',
    })),
  );
  const students = await Student.create(
    Array.from({ length: 12 }, (_, i) => ({
      student_name: `Student ${i + 1}`,
      registration_number: `S${i + 1}`,
      email_address: `s${i + 1}@depease.test`,
      password: 'Test password 2026!',
      phone_number: '123',
      batch: 2026,
      semester: 7,
      department: 'CS',
    })),
  );
  const [admin, supervisor, panel, outsiderTeacher] = staff.map((account, i) =>
    createAccessToken(account._id, i === 0 ? 'admin' : 'teacher', account.email, config),
  );
  const tokens = students.map((account) =>
    createAccessToken(account._id, 'student', account.email_address, config),
  );
  const proposalData = {
    title: 'DepEase',
    ProjectType: 'Development',
    supervisor: 'T1',
    problemStatement: 'Problem',
    problemSolution: 'Solution',
    scope: 'Scope',
    timeline: ['Milestone'],
    technologyUsed: 'Node',
    modules: ['API'],
  };
  const groups = await Group.create(
    [0, 3].map((offset) => ({
      teamLeadId: `S${offset + 1}`,
      teammate1Id: `S${offset + 2}`,
      teammate2Id: `S${offset + 3}`,
      members: [1, 2, 3].map((n) => `S${offset + n}`),
    })),
  );
  const proposals = await Proposal.create(
    groups.map((_, i) => ({ ...proposalData, ownerId: String(students[i * 3]._id) })),
  );
  const projects = await Project.create(
    groups.map((group, i) => ({
      ProjectId: i ? '507f1f77bcf86cd799439011' : 'P1',
      group: String(group._id),
      projectProposal: String(proposals[i]._id),
      teacher: i ? 'T3' : 'T1',
      batch: 2026,
      semester: 7,
    })),
  );
  const [p1, p2] = projects;
  const requirement = await Requirement.create({
    title: 'Private requirement',
    description: 'Private',
    deadline: '2026-12-01',
    writtenby: 'S1',
    projectid: 'P1',
  });
  const task = await Task.create({
    summary: 'Private task',
    status: 'Pending',
    assignee: 'S1',
    reporter: 'S1',
    priority: 'Medium',
    projectid: 'P1',
  });

  await t.test('teachers cannot acquire administrator access or use admin APIs', async () => {
    for (let i = 1; i < staff.length; i++) {
      const session = expect(
        await request('/loginT', undefined, {
          email: staff[i].email,
          password: 'Test password 2026!',
        }),
        200,
      );
      assert.equal(session.role, 'teacher');
      expect(await request('/panel/getAllPanels', session.token), 403);
      expect(await request('/student/create', session.token, {}), 403);
      expect(await request('/teacher/create', session.token, {}), 403);
    }
    const session = expect(
      await request('/loginT', undefined, {
        email: staff[0].email,
        password: 'Test password 2026!',
      }),
      200,
    );
    assert.equal(session.role, 'admin');
    expect(await request('/panel/getAllPanels', session.token), 200);
  });

  await t.test(
    'original read/write triggers, aliases, ID encodings, and legitimate controls',
    async () => {
      expect(await request('/requirements/getRequirements/P1', tokens[3]), 403);
      expect(
        await request(`/tasks/update/${task._id}`, tokens[3], { status: 'Completed' }, 'PUT'),
        403,
      );
      assert.equal((await Task.findById(task._id)).status, 'Pending');
      expect(await request(`/requirements/findRequirement/${requirement._id}`, tokens[3]), 403);
      expect(
        await request(
          `/requirements/updatePriority/${requirement._id}`,
          tokens[3],
          { priority: 'High' },
          'PATCH',
        ),
        403,
      );
      expect(
        await request(
          `/requirements/deleteRequirement/${requirement._id}`,
          tokens[3],
          undefined,
          'DELETE',
        ),
        403,
      );
      expect(
        await request(`/requirements/addComment/${requirement._id}`, tokens[3], {
          content: 'Intrusion',
        }),
        403,
      );
      expect(
        await request(`/requirements/uploadAttachment/${requirement._id}`, tokens[3], {
          attachment: 'https://example.com',
        }),
        403,
      );
      for (const prefix of ['/project', '/projects']) {
        const scoped = expect(await request(`${prefix}/getall`, tokens[3]), 200);
        assert.deepEqual(
          scoped.map((item) => item.ProjectId),
          [p2.ProjectId],
        );
        expect(await request(`${prefix}/getmine/${p1._id}`, tokens[3]), 403);
      }
      assert.equal(
        expect(await request(`/requirements/getRequirements/${p2.ProjectId}`, tokens[3]), 200)
          .length,
        0,
      );
      for (const token of [tokens[0], tokens[1], supervisor, admin]) {
        assert.equal(
          expect(await request('/requirements/getRequirements/P1', token), 200).length,
          1,
        );
        expect(
          await request(`/tasks/update/${task._id}`, token, { status: 'In Progress' }, 'PUT'),
          200,
        );
      }
      expect(await request('/requirements/getRequirements/P1', outsiderTeacher), 403);
      expect(
        await request(
          `/requirements/updateRequirement/${requirement._id}`,
          tokens[0],
          { projectid: p2.ProjectId },
          'PUT',
        ),
        400,
      );
      expect(
        await request('/requirements/createRequirement', tokens[3], {
          title: 'Spoof',
          description: 'x',
          deadline: '2026-12-01',
          projectid: 'P1',
        }),
        403,
      );
      expect(
        await request(
          `/requirements/updateRequirement/${requirement._id}`,
          tokens[0],
          { comments: [{ content: 'Spoof' }] },
          'PUT',
        ),
        400,
      );
      expect(await request('/requirements/getRequirements/P1'), 401);
    },
  );

  await t.test('ownership bootstrap and foreign references cannot grant access', async () => {
    expect(
      await request(`/group/update/${groups[0]._id}`, tokens[3], { teamLeadId: 'S4' }, 'PUT'),
      403,
    );
    expect(
      await request('/group/add', tokens[6], {
        teamLeadId: 'S7',
        teammate1Id: 'S1',
        teammate2Id: 'S8',
      }),
      409,
    );
    expect(
      await request('/project/add', tokens[3], {
        ProjectId: 'Stolen',
        group: String(groups[0]._id),
        projectProposal: String(proposals[0]._id),
        teacher: 'T1',
        batch: 2026,
        semester: 7,
      }),
      403,
    );
    expect(
      await request(
        `/proposals/proposals/${proposals[0]._id}`,
        tokens[3],
        { title: 'Stolen' },
        'PUT',
      ),
      403,
    );
    expect(
      await request('/proposals/add', tokens[6], {
        ...proposalData,
        ownerId: String(students[0]._id),
      }),
      400,
    );
    const oldProposal = await Proposal.create(proposalData);
    expect(await request(`/proposals/getmine/${oldProposal._id}`, tokens[6]), 403);
    expect(await request(`/proposals/getmine/${oldProposal._id}`, admin), 200);
    const module = expect(
      await request('/modules/add', tokens[3], {
        projectId: p2.ProjectId,
        name: 'Other module',
        details: 'Other',
      }),
      201,
    );
    const deliverable = expect(
      await request('/deliverables/add', tokens[0], {
        projectId: 'P1',
        name: 'Milestone',
        deadline: '2026-12-01',
      }),
      201,
    );
    expect(
      await request('/deliverables/addModuleToDeliverable', tokens[0], {
        moduleId: module._id,
        deliverableId: deliverable._id,
      }),
      403,
    );
    expect(
      await request(
        `/deliverables/update/${deliverable._id}`,
        tokens[0],
        { modules: [module] },
        'PUT',
      ),
      400,
    );
    expect(
      await request('/teamMember/addMember', tokens[0], {
        projectid: 'P1',
        student_id: 'S4',
        student_status: 'Active',
        student_role: 'Member',
      }),
      400,
    );
    expect(
      await request('/teamMember/addMember', tokens[0], {
        projectid: 'P1',
        student_id: 'S1',
        student_status: 'Active',
        student_role: 'Lead',
        student_name: 'Spoof',
        student_email: 'spoof@depease.test',
        requirements: [String(requirement._id)],
      }),
      200,
    );
    const members = expect(await request('/teamMember/getMembers/P1', tokens[0]), 200);
    assert.equal(members[0].student_email, students[0].email_address);
  });

  await t.test('assigned panel can review and grade but cannot mutate project work', async () => {
    expect(
      await request('/panel/createPanel', admin, {
        id: 'PANEL',
        teachers: [{ employeeId: 'T2', panelHead: true }],
      }),
      201,
    );
    expect(
      await request('/panel/assignPanel', admin, { panelId: 'PANEL', studentIds: ['P1'] }),
      201,
    );
    expect(
      await request('/panel/assignPanel', admin, { panelId: 'PANEL', studentIds: ['missing'] }),
      400,
    );
    expect(await request('/requirements/getRequirements/P1', panel), 200);
    expect(await request(`/tasks/update/${task._id}`, panel, { status: 'Completed' }, 'PUT'), 403);
    const template = await require('../../src/models/evaluation.model').create({
      totalWeightage: 10,
      evaluationType: 'Proposal',
      fields: [{ name: 'Clarity', weightage: 10 }],
    });
    const markInput = {
      ProjectId: 'P1',
      evalFormId: String(template._id),
      TeacherId: 'T2',
      comments: 'Good',
      fields: [{ name: 'Clarity', Subobtain: 8 }],
      totalWeightage: 100,
      obtainedMarks: 100,
    };
    const marks = expect(await request('/addMarks/add', panel, markInput), 201);
    assert.equal(marks.obtainedMarks, 8);
    assert.equal(marks.totalWeightage, 10);
    expect(await request('/addMarks/add', outsiderTeacher, { ...markInput, TeacherId: 'T3' }), 403);
    expect(await request('/addMarks/add', panel, { ...markInput, TeacherId: 'T1' }), 403);
    expect(
      await request('/addMarks/add', panel, {
        ...markInput,
        fields: [{ name: 'Clarity', Subobtain: 11 }],
      }),
      400,
    );
    expect(
      await request(`/addMarks/record/${marks._id}`, supervisor, { comments: 'Overwrite' }, 'PUT'),
      403,
    );
    await template.updateOne({ fields: [{ name: 'New criteria', weightage: 20 }] });
    const corrected = expect(
      await request(`/addMarks/record/${marks._id}`, admin, { comments: 'Corrected' }, 'PUT'),
      200,
    );
    assert.equal(corrected.TeacherId, 'T2');
    expect(
      await request(`/addMarks/record/${marks._id}`, panel, { comments: 'Updated' }, 'PUT'),
      200,
    );
    expect(await request('/fypPanel/getall/T2', outsiderTeacher), 200);
    assert.equal(expect(await request('/fypPanel/getall/T2', outsiderTeacher), 200).length, 0);
    expect(
      await request('/panel/editPanelId/PANEL', admin, { newPanelId: ' RENAMED ' }, 'PUT'),
      200,
    );
    assert.equal(await Assignment.countDocuments({ panelId: 'RENAMED' }), 1);
    expect(await request('/panel/deletePanelbyID/RENAMED', admin, undefined, 'DELETE'), 200);
    assert.equal(await Assignment.countDocuments({ panelId: { $in: ['PANEL', 'RENAMED'] } }), 0);
    assert.equal(await Panel.countDocuments({ id: 'RENAMED' }), 0);
    expect(await request('/requirements/getRequirements/P1', panel), 403);
  });

  await t.test('resource decisions and scheduler references respect project roles', async () => {
    const resource = expect(
      await request('/resource/add', tokens[0], {
        projectId: 'P1',
        studentId: 'S4',
        email: 'spoof@depease.test',
        phoneNumber: '123',
        projectTitle: 'DepEase',
        requestType: 'VM',
        requestReason: 'Build',
        startDate: '2026-11-01',
        endDate: '2026-12-01',
        adminStatus: 'Approved',
        supervisorStatus: 'Approved',
      }),
      201,
    );
    assert.equal(resource.studentId, 'S1');
    assert.equal(resource.adminStatus, 'Pending');
    expect(
      await request(
        `/resource/update/${resource._id}`,
        supervisor,
        { adminStatus: 'Approved' },
        'PUT',
      ),
      403,
    );
    expect(
      await request(
        `/resource/update/${resource._id}`,
        outsiderTeacher,
        { supervisorStatus: 'Approved' },
        'PUT',
      ),
      403,
    );
    expect(
      await request(
        `/resource/update/${resource._id}`,
        supervisor,
        { supervisorStatus: 'Rejected' },
        'PUT',
      ),
      400,
    );
    expect(
      await request(
        `/resource/update/${resource._id}`,
        supervisor,
        { supervisorStatus: 'Approved' },
        'PUT',
      ),
      200,
    );
    expect(
      await request(`/resource/update/${resource._id}`, admin, { adminStatus: 'Approved' }, 'PUT'),
      200,
    );
    expect(
      await request('/scheduler/scheduler', outsiderTeacher, {
        id: 'slot',
        Project: String(p1._id),
        start: '2026-11-01T12:00:00Z',
        end: '2026-11-01T13:00:00Z',
        type: 'Proposal',
      }),
      403,
    );
    const event = expect(
      await request('/scheduler/scheduler', supervisor, {
        id: 'slot',
        Project: String(p1._id),
        start: '2026-11-01T12:00:00Z',
        end: '2026-11-01T13:00:00Z',
        type: 'Proposal',
      }),
      201,
    );
    expect(await request(`/scheduler/scheduler/${event._id}`, outsiderTeacher), 403);
    expect(
      await request(
        `/scheduler/scheduler/${event._id}`,
        supervisor,
        { end: '2026-11-01T11:00:00Z' },
        'PUT',
      ),
      400,
    );
  });

  await t.test(
    'local uploads are private, downloadable, bounded and removed with metadata',
    async () => {
      function form(projectId = 'P1', size = 12) {
        const data = new FormData();
        data.set('ProjectId', projectId);
        data.set('filename', 'report.txt');
        data.set(
          'file',
          new Blob([size === 12 ? 'Hello DepEase' : new Uint8Array(size)]),
          'report.txt',
        );
        return data;
      }
      expect(await request('/documents/add', tokens[3], form()), 403);
      assert.equal((await fs.readdir(uploadDir)).length, 0);
      const file = expect(await request('/documents/add', tokens[0], form()), 201);
      assert.equal(file.provider, 'local');
      expect(await request(`/documents/download/${file._id}`, tokens[3]), 403);
      expect(await request(`/documents/download/${file._id}`), 401);
      const download = await request(`/documents/download/${file._id}`, tokens[1]);
      expect(download, 200);
      assert.equal(download.data, 'Hello DepEase');
      assert.match(download.headers.get('content-disposition'), /attachment/);
      assert.match(download.headers.get('cache-control'), /no-store/);
      expect(await request('/documents/add', tokens[0], form('P1', 10 * 1024 * 1024 + 1)), 413);
      expect(await request(`/documents/delete/${file._id}`, tokens[3], undefined, 'DELETE'), 403);
      expect(await request(`/documents/delete/${file._id}`, tokens[0], undefined, 'DELETE'), 204);
      assert.equal((await fs.readdir(uploadDir)).length, 0);
      expect(await request(`/documents/download/${file._id}`, tokens[0]), 404);
    },
  );

  await t.test(
    'atomic proposal submission rolls back on conflict and reuses safe retries',
    async () => {
      const payload = {
        requestId: 'submission-00000001',
        ProjectId: 'P1',
        batch: 2026,
        semester: 7,
        proposal: proposalData,
        group: { teamLeadId: 'S7', teammate1Id: 'S8', teammate2Id: 'S9' },
      };
      const before = [
        await Proposal.countDocuments(),
        await Group.countDocuments(),
        await Project.countDocuments(),
      ];
      expect(await request('/projects/submit-proposal', tokens[6], payload), 409);
      assert.deepEqual(
        [
          await Proposal.countDocuments(),
          await Group.countDocuments(),
          await Project.countDocuments(),
        ],
        before,
      );
      payload.ProjectId = 'P3';
      const project = expect(await request('/projects/submit-proposal', tokens[6], payload), 201);
      const retry = expect(await request('/project/submit-proposal', tokens[6], payload), 201);
      assert.equal(project._id, retry._id);
      assert.equal(await Project.countDocuments({ ProjectId: 'P3' }), 1);
      expect(
        await request('/projects/submit-proposal', tokens[6], { ...payload, ProjectId: 'Changed' }),
        409,
      );
      const parallel = {
        ...payload,
        requestId: 'submission-00000002',
        ProjectId: 'P4',
        group: { teamLeadId: 'S10', teammate1Id: 'S11', teammate2Id: 'S12' },
      };
      const responses = await Promise.all([
        request('/projects/submit-proposal', tokens[9], parallel),
        request('/projects/submit-proposal', tokens[9], parallel),
      ]);
      for (const response of responses) expect(response, 201);
      assert.equal(responses[0].data._id, responses[1].data._id);
      expect(await request('/requirements/getRequirements/P3', tokens[7]), 200);
      expect(await request('/requirements/getRequirements/P3', tokens[0]), 403);
    },
  );

  await t.test('internal messages work without SMTP and mailboxes remain private', async () => {
    const sent = expect(
      await request('/email/send', tokens[0], {
        recipientEmail: 's4@depease.test',
        subject: 'Hello',
        message: 'Internal message',
      }),
      200,
    );
    assert.equal(sent.delivery, 'internal');
    const inbox = expect(await request('/email/getreceived/s4%40depease.test', tokens[3]), 200);
    assert.equal(inbox.length, 1);
    assert.equal(inbox[0].sender, 's1@depease.test');
    expect(await request('/email/getreceived/s4%40depease.test', tokens[0]), 403);
    expect(
      await request('/email/send', tokens[0], {
        recipientEmail: 'external@example.com',
        subject: 'Hello',
        message: 'External',
      }),
      503,
    );
  });

  await t.test(
    'Jenkins actions cannot target a foreign saved job and deleted accounts lose access',
    async () => {
      await Pipeline.create({
        ProjectId: 'P1',
        Type: 'Frontend',
        job_name: 'private-job',
        git_repo_url: 'https://github.com/example/repo',
        selectedTool: 'ReactJs',
      });
      expect(
        await request('/jenkins/buildPipline', outsiderTeacher, { job_name: 'private-job' }),
        403,
      );
      expect(
        await request(
          '/jenkins/deletePipline?ProjectId=P1&job_name=private-job',
          outsiderTeacher,
          undefined,
          'DELETE',
        ),
        403,
      );
      expect(
        await request('/jenkins/getDeploymentLink', outsiderTeacher, {
          ProjectId: 'P1',
          Type: 'Frontend',
        }),
        403,
      );
      expect(
        await request('/jenkins/createPipelineJob', outsiderTeacher, {
          ProjectId: 'P1',
          Type: 'Frontend',
          jobname: 'stolen',
          githubLink: 'https://github.com/example/repo',
          selectedTool: 'ReactJs',
        }),
        403,
      );
      expect(await request('/workspace/capabilities', tokens[0]), 200);
      await Student.deleteOne({ _id: students[11]._id });
      expect(await request('/projects/getall', tokens[11]), 401);
    },
  );
  await t.test(
    'retired business identifiers cannot transfer historical data to another team',
    async () => {
      expect(await request(`/projects/delete/${p1._id}`, admin, undefined, 'DELETE'), 200);
      expect(await request('/requirements/getRequirements/P1', tokens[0]), 404);
      expect(
        await request('/projects/add', tokens[3], {
          ProjectId: 'P1',
          group: String(groups[1]._id),
          projectProposal: String(proposals[1]._id),
          teacher: 'T1',
          batch: 2026,
          semester: 7,
        }),
        409,
      );
      expect(await request('/requirements/getRequirements/P1', tokens[3]), 404);
      assert.ok(await Requirement.findById(requirement._id));
      assert.ok((await Project.findById(p1._id)).retiredAt);
      assert.equal(
        expect(await request('/projects/getall', admin), 200).some(
          (project) => project.ProjectId === 'P1',
        ),
        false,
      );
      await Task.create({
        summary: 'Legacy retained task',
        status: 'Pending',
        assignee: 'S1',
        reporter: 'S1',
        priority: 'Medium',
        projectid: 'historical-id',
      });
      expect(
        await request('/projects/add', tokens[3], {
          ProjectId: 'historical-id',
          group: String(groups[1]._id),
          projectProposal: String(proposals[1]._id),
          teacher: 'T1',
          batch: 2026,
          semester: 7,
        }),
        409,
      );
      expect(
        await request('/project/submit-proposal', tokens[3], {
          requestId: 'retired-attempt-000001',
          ProjectId: 'P1',
          group: { teamLeadId: 'S4', teammate1Id: 'S5', teammate2Id: 'S6' },
          proposal: proposalData,
          batch: 2026,
          semester: 7,
        }),
        409,
      );
    },
  );
});
