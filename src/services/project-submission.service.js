const { createHash } = require('node:crypto');
const mongoose = require('mongoose');
const Project = require('../models/project.model');
const Proposal = require('../models/proposal.model');
const Group = require('../models/group.model');
const {
  prepareCreate,
  prepareGroup,
  assertProjectIdAvailable,
} = require('./project-access.service');
const { HttpError } = require('../errors/http-error');

async function submitProject(req) {
  if (req.user.role !== 'student')
    throw new HttpError(403, 'Only students submit project proposals');
  const { requestId, proposal, group, ProjectId, batch, semester } = req.body;
  if (typeof requestId !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(requestId))
    throw new HttpError(400, 'A stable submission request ID is required');
  if (!proposal || !group || typeof ProjectId !== 'string' || !ProjectId.trim())
    throw new HttpError(400, 'Proposal, group, and project details are required');
  const submissionKey = `${req.user.sub}:${requestId}`;
  const submissionHash = createHash('sha256')
    .update(JSON.stringify({ proposal, group, ProjectId, batch, semester }))
    .digest('hex');
  async function existingSubmission() {
    const existing = await Project.findOne({ submissionKey });
    if (existing && existing.submissionHash !== submissionHash)
      throw new HttpError(409, 'This submission key was already used for different details');
    return existing;
  }
  const existing = await existingSubmission();
  if (existing) {
    if (existing.retiredAt)
      throw new HttpError(
        409,
        'This submitted project was archived. Start a new proposal with a new identifier.',
      );
    return existing;
  }
  await assertProjectIdAvailable(ProjectId.trim());
  // These trusted builders perform the same membership and supervisor validation as legacy APIs.
  const proposalInput = await prepareCreate(Proposal, req, proposal);
  const groupInput = await prepareGroup(req, group);
  const draftProject = new Project({
    ProjectId: ProjectId.trim(),
    batch,
    semester,
    teacher: proposalInput.supervisor,
    group: new mongoose.Types.ObjectId().toString(),
    projectProposal: new mongoose.Types.ObjectId().toString(),
  });
  await draftProject.validate();
  try {
    return await mongoose.connection.transaction(async (session) => {
      const [createdProposal] = await Proposal.create([proposalInput], { session });
      const [createdGroup] = await Group.create([groupInput], { session });
      const [project] = await Project.create(
        [
          {
            ...draftProject.toObject(),
            group: String(createdGroup._id),
            projectProposal: String(createdProposal._id),
            submissionKey,
            submissionHash,
          },
        ],
        { session },
      );
      return project;
    });
  } catch (error) {
    if (error.code === 11000) {
      const saved = await existingSubmission();
      if (saved) return saved;
    }
    if (error.code === 20)
      throw new HttpError(
        503,
        'Project submission requires a MongoDB replica set. Use the provided local setup or a configured MongoDB cluster.',
      );
    throw error;
  }
}

module.exports = { submitProject };
