const mongoose = require('mongoose');
const Project = require('../models/project.model');
const Group = require('../models/group.model');
const Proposal = require('../models/proposal.model');
const Student = require('../models/student.model');
const Teacher = require('../models/teacher.model');
const Panel = require('../models/panel.model');
const Assignment = require('../models/panel-assignment.model');
const { HttpError } = require('../errors/http-error');
const { requireRecord, pickFields } = require('../utils/records');

const MEMBER_FIELDS = ['teamLeadId', 'teammate1Id', 'teammate2Id'];
const PROJECT_FIELDS = new Map([
  ['Requirement', 'projectid'],
  ['Task', 'projectid'],
  ['TeamMember', 'projectid'],
  ['Module', 'projectId'],
  ['Deliverable', 'projectId'],
  ['ResourceRequest', 'projectId'],
  ['File', 'ProjectId'],
  ['SuperAnnouncement', 'ProjectId'],
  ['AddMarks', 'ProjectId'],
  ['Pipeline', 'ProjectId'],
  ['Scheduler', 'Project'],
]);
const admin = (req) => req.user.role === 'admin';
const forbidden = () => {
  throw new HttpError(403, 'You do not have access to this project');
};
const memberQuery = (registration) => ({
  $or: MEMBER_FIELDS.map((field) => ({ [field]: registration })),
});
const equal = (a, b) => String(a) === String(b);

async function projectsFor(req, { write = false, review = false } = {}) {
  if (admin(req)) return Project.find({ retiredAt: null });
  const cacheKey = `${write}:${review}`;
  req.projectScopes ||= new Map();
  if (!req.projectScopes.has(cacheKey))
    req.projectScopes.set(
      cacheKey,
      (async () => {
        if (req.user.role === 'student') {
          const groups = await Group.find(memberQuery(req.actor.registration_number)).select('_id');
          return Project.find({
            retiredAt: null,
            group: { $in: groups.map((group) => String(group._id)) },
          });
        }
        const filter = [{ teacher: req.actor.employeeId }];
        if (!write || review) {
          const panels = await Panel.find({ 'teachers.employeeId': req.actor.employeeId }).select(
            'id',
          );
          const assignments = await Assignment.find({
            panelId: { $in: panels.map((panel) => panel.id) },
          });
          filter.push({ ProjectId: { $in: assignments.flatMap((item) => item.studentIds) } });
        }
        return Project.find({ retiredAt: null, $or: filter });
      })(),
    );
  return req.projectScopes.get(cacheKey);
}

// Callers select the key type explicitly: a 24-hex business ID is never treated as a Mongo ID.
async function projectAccess(req, value, { mongo = false, write = false, review = false } = {}) {
  if (typeof value !== 'string' && !(value instanceof mongoose.Types.ObjectId))
    throw new HttpError(400, 'A project identifier is required');
  if (mongo && !mongoose.isObjectIdOrHexString(value))
    throw new HttpError(400, 'Invalid project record ID');
  const project = requireRecord(
    await Project.findOne({ ...(mongo ? { _id: value } : { ProjectId: value }), retiredAt: null }),
    'Project',
  );
  if (
    !admin(req) &&
    !(await projectsFor(req, { write, review })).some((item) => equal(item._id, project._id))
  )
    forbidden();
  return project;
}

async function groupAccess(req, group, write = false) {
  if (admin(req)) return;
  if (write) forbidden(); // Enrollment changes require an administrator.
  if (
    req.user.role === 'student' &&
    MEMBER_FIELDS.some((key) => group[key] === req.actor.registration_number)
  )
    return;
  if ((await projectsFor(req)).some((project) => equal(project.group, group._id))) return;
  forbidden();
}

async function proposalAccess(req, proposal, write = false) {
  if (admin(req)) return;
  const project = await Project.findOne({ projectProposal: String(proposal._id) });
  if (project) {
    await projectAccess(req, project._id, { mongo: true, write });
    return;
  }
  if (!equal(proposal.ownerId, req.user.sub)) forbidden();
}

async function authorizeRecord(model, req, record, write = false) {
  const name = model.modelName;
  if (name === 'Project') {
    if (write && !admin(req)) forbidden();
    await projectAccess(req, record._id, { mongo: true, write });
  } else if (name === 'Group') await groupAccess(req, record, write);
  else if (name === 'Proposal') await proposalAccess(req, record, write);
  else if (PROJECT_FIELDS.has(name)) {
    await projectAccess(req, record[PROJECT_FIELDS.get(name)], {
      mongo: name === 'Scheduler',
      write,
      review: name === 'AddMarks',
    });
    if (write && name === 'AddMarks' && !admin(req) && record.TeacherId !== req.actor.employeeId)
      forbidden();
  }
}

async function filterCollection(model, req, filter = {}) {
  const name = model.modelName;
  const projectField = PROJECT_FIELDS.get(name);
  if (!projectField && !['Project', 'Group', 'Proposal', 'Panel', 'AssignmentPanel'].includes(name))
    return filter;
  if (admin(req) && !projectField)
    return name === 'Project' ? { $and: [filter, { retiredAt: null }] } : filter;
  const projects = await projectsFor(req);
  let scope;
  if (name === 'Project') scope = { _id: { $in: projects.map((item) => item._id) } };
  else if (name === 'Group')
    scope =
      req.user.role === 'student'
        ? memberQuery(req.actor.registration_number)
        : { _id: { $in: projects.map((item) => item.group) } };
  else if (name === 'Proposal')
    scope = {
      $or: [
        { _id: { $in: projects.map((item) => item.projectProposal) } },
        { ownerId: req.user.sub },
      ],
    };
  else if (name === 'Panel') scope = { 'teachers.employeeId': req.actor.employeeId };
  else if (name === 'AssignmentPanel') {
    const panels = await Panel.find({ 'teachers.employeeId': req.actor.employeeId }).select('id');
    scope = { panelId: { $in: panels.map((item) => item.id) } };
  } else {
    if (Object.hasOwn(filter, projectField))
      await projectAccess(req, filter[projectField], { mongo: name === 'Scheduler' });
    scope = {
      [projectField]: {
        $in: projects.map((item) => (name === 'Scheduler' ? item._id : item.ProjectId)),
      },
    };
  }
  return { $and: [filter, scope] };
}

async function prepareGroup(req, input, existing) {
  if (
    !admin(req) &&
    (req.user.role !== 'student' || existing || input.teamLeadId !== req.actor.registration_number)
  )
    forbidden();
  const values = MEMBER_FIELDS.map((key) =>
    typeof input[key] === 'string' ? input[key].trim() : '',
  );
  if (values.some((value) => !value) || new Set(values).size !== 3)
    throw new HttpError(400, 'A group requires three different student registrations');
  if ((await Student.countDocuments({ registration_number: { $in: values } })) !== 3)
    throw new HttpError(400, 'All group members must be registered students');
  const collisions = await Group.findOne({
    $and: [
      { $or: MEMBER_FIELDS.map((key) => ({ [key]: { $in: values } })) },
      ...(existing ? [{ _id: { $ne: existing._id } }] : []),
    ],
  });
  if (collisions) throw new HttpError(409, 'A student already belongs to a group');
  return {
    ...Object.fromEntries(MEMBER_FIELDS.map((key, index) => [key, values[index]])),
    members: values,
  };
}

async function validateProject(req, input) {
  const group = requireRecord(await Group.findById(input.group), 'Group');
  const proposal = requireRecord(await Proposal.findById(input.projectProposal), 'Proposal');
  if (!(await Teacher.exists({ employeeId: input.teacher })))
    throw new HttpError(400, 'Supervisor not found');
  if (!admin(req)) {
    if (
      req.user.role !== 'student' ||
      group.teamLeadId !== req.actor.registration_number ||
      !equal(proposal.ownerId, req.user.sub)
    )
      forbidden();
    if (proposal.supervisor !== input.teacher)
      throw new HttpError(400, 'Project supervisor must match its proposal');
  }
}

async function assertProjectIdAvailable(id) {
  if (typeof id !== 'string' || !id.trim())
    throw new HttpError(400, 'Project identifier is required');
  if (await Project.exists({ ProjectId: id }))
    throw new HttpError(409, 'This project identifier is already used or retired');
  // Historical hard deletes may have left children without a Project row. Never adopt them.
  for (const [name, field] of PROJECT_FIELDS) {
    if (name !== 'Scheduler' && (await mongoose.model(name).exists({ [field]: id }))) {
      throw new HttpError(
        409,
        'This identifier belongs to retained project records. Choose a new identifier.',
      );
    }
  }
  if (await Assignment.exists({ studentIds: id }))
    throw new HttpError(409, 'This identifier belongs to a retained panel assignment');
}

async function validateRequirements(projectId, values) {
  if (
    !Array.isArray(values) ||
    values.some((id) => typeof id !== 'string' || !mongoose.isObjectIdOrHexString(id))
  )
    throw new HttpError(400, 'Use requirement record IDs');
  const Requirement = require('../models/requirement.model');
  if (
    (await Requirement.countDocuments({ _id: { $in: values }, projectid: projectId })) !==
    new Set(values).size
  )
    throw new HttpError(400, 'Requirements must belong to the member project');
}

function cleanInput(model, input) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new HttpError(400, 'Use an object for record details');
  for (const key of [
    '_id',
    '__v',
    'ownerId',
    'members',
    'submissionKey',
    'submissionHash',
    'retiredAt',
  ])
    if (Object.hasOwn(input, key)) throw new HttpError(400, `${key} is managed by the server`);
  return pickFields(
    input,
    Object.keys(model.schema.paths).filter(
      (key) => !key.includes('.') && Object.hasOwn(input, key) && input[key] !== undefined,
    ),
  );
}

async function prepareCreate(model, req, raw) {
  const input = cleanInput(model, raw);
  const name = model.modelName;
  if (name === 'Group') return prepareGroup(req, input);
  if (name === 'Proposal') {
    if (!(await Teacher.exists({ employeeId: input.supervisor })))
      throw new HttpError(400, 'Choose an existing supervisor');
    if (req.user.role === 'teacher' && input.supervisor !== req.actor.employeeId) forbidden();
    return { ...input, ownerId: req.user.sub };
  }
  if (name === 'Project') {
    await validateProject(req, input);
    await assertProjectIdAvailable(input.ProjectId);
    return input;
  }
  const field = PROJECT_FIELDS.get(name);
  if (!field) return input;
  const project = await projectAccess(req, input[field], {
    mongo: name === 'Scheduler',
    write: true,
    review: name === 'AddMarks',
  });
  if (name === 'Requirement') {
    if (input.comments?.length)
      throw new HttpError(400, 'Add comments through the discussion endpoint');
    input.writtenby = req.actor.registration_number || req.actor.employeeId;
  }
  if (name === 'Deliverable' && input.modules?.length)
    throw new HttpError(400, 'Link modules through the module endpoint');
  if (name === 'TeamMember') {
    const group = await Group.findById(project.group);
    if (!group || !MEMBER_FIELDS.some((key) => group[key] === input.student_id))
      throw new HttpError(400, 'Team member must belong to the registered project group');
    const student = requireRecord(
      await Student.findOne({ registration_number: input.student_id }),
      'Student',
    );
    Object.assign(input, {
      student_name: student.student_name,
      student_email: student.email_address,
      team_lead_id: group.teamLeadId,
    });
    await validateRequirements(project.ProjectId, input.requirements || []);
  }
  if (name === 'ResourceRequest') {
    if (!admin(req) && req.user.role !== 'student') forbidden();
    if (req.user.role === 'student')
      Object.assign(input, {
        studentId: req.actor.registration_number,
        email: req.actor.email_address,
      });
    Object.assign(input, {
      TeacherId: project.teacher,
      adminStatus: 'Pending',
      supervisorStatus: 'Pending',
      rejectionReason_T: '',
      rejectionReason_S: '',
    });
  }
  if (name === 'SuperAnnouncement') input.TeacherId = req.actor.employeeId;
  if (name === 'AddMarks') return prepareMarks(req, input);
  return input;
}

async function prepareMarks(req, input, existing) {
  const Evaluation = require('../models/evaluation.model');
  const template =
    existing || requireRecord(await Evaluation.findById(input.evalFormId), 'Evaluation template');
  if (input.TeacherId && !admin(req) && input.TeacherId !== req.actor.employeeId) forbidden();
  if (!Array.isArray(input.fields) || input.fields.length !== template.fields.length)
    throw new HttpError(400, 'Complete every evaluation criterion');
  const fields = template.fields.map((field, index) => {
    const score = input.fields[index];
    if (
      score.name !== field.name ||
      !Number.isFinite(score.Subobtain) ||
      score.Subobtain < 0 ||
      score.Subobtain > field.weightage
    )
      throw new HttpError(400, 'Marks must be within the criterion limits');
    return { name: field.name, weightage: field.weightage, Subobtain: score.Subobtain };
  });
  return {
    ...input,
    fields,
    TeacherId: existing?.TeacherId || req.actor.employeeId,
    totalWeightage: fields.reduce((sum, field) => sum + field.weightage, 0),
    obtainedMarks: fields.reduce((sum, field) => sum + field.Subobtain, 0),
    evaluationType: template.evaluationType,
  };
}

async function prepareUpdate(model, req, record, raw) {
  await authorizeRecord(model, req, record, true);
  const input = cleanInput(model, raw);
  const name = model.modelName;
  const frozen = [
    PROJECT_FIELDS.get(name),
    ...(name === 'Project' ? ['ProjectId'] : []),
    ...(name === 'Proposal' ? ['supervisor'] : []),
    ...(name === 'TeamMember'
      ? ['student_id', 'team_lead_id', 'student_email', 'student_name']
      : []),
    ...(name === 'Requirement' ? ['writtenby'] : []),
  ].filter(Boolean);
  for (const key of frozen)
    if (Object.hasOwn(input, key) && !equal(input[key], record[key]))
      throw new HttpError(400, `${key} cannot be changed on this record`);
  if (name === 'Group') return prepareGroup(req, { ...record.toObject(), ...input }, record);
  if (name === 'Project') await validateProject(req, { ...record.toObject(), ...input });
  if (
    name === 'Requirement' &&
    (Object.hasOwn(input, 'comments') || Object.hasOwn(input, 'attachments'))
  )
    throw new HttpError(400, 'Use the comment and attachment endpoints');
  if (name === 'Deliverable' && Object.hasOwn(input, 'modules'))
    throw new HttpError(400, 'Use the module linking endpoints');
  if (name === 'TeamMember' && input.requirements)
    await validateRequirements(record.projectid, input.requirements);
  if (name === 'ResourceRequest') {
    const allowed = admin(req)
      ? ['adminStatus', 'rejectionReason_S']
      : ['supervisorStatus', 'rejectionReason_T'];
    if (Object.keys(raw).some((key) => !allowed.includes(key)))
      throw new HttpError(403, 'Only your approval decision and feedback can be changed');
    const status = input[allowed[0]];
    if (status && !['Pending', 'Approved', 'Rejected'].includes(status))
      throw new HttpError(400, 'Invalid approval decision');
    if (status === 'Rejected' && !input[allowed[1]]?.trim())
      throw new HttpError(400, 'A rejection reason is required');
  }
  if (name === 'AddMarks') {
    if (Object.hasOwn(input, 'TeacherId') && input.TeacherId !== record.TeacherId)
      throw new HttpError(400, 'Evaluator cannot be changed');
    if (Object.hasOwn(input, 'evalFormId') && input.evalFormId !== record.evalFormId)
      throw new HttpError(400, 'Evaluation template cannot be changed');
    return prepareMarks(req, { ...record.toObject(), ...input }, record);
  }
  return input;
}

async function recordAccess(model, req, id, write = false) {
  const record = requireRecord(await model.findById(id), model.modelName);
  await authorizeRecord(model, req, record, write);
  return record;
}

module.exports = {
  PROJECT_FIELDS,
  MEMBER_FIELDS,
  memberQuery,
  projectsFor,
  projectAccess,
  authorizeRecord,
  filterCollection,
  prepareCreate,
  prepareUpdate,
  prepareGroup,
  validateProject,
  assertProjectIdAvailable,
  recordAccess,
};
