const ProjectIdea = require('../models/project-idea.model');
const { createCrudHandlers } = require('./crud-handlers');
const { asyncHandler } = require('../utils/async-handler');
const handlers = createCrudHandlers(ProjectIdea, 'Project idea');

exports.getAllProjectIdeas = handlers.list();
exports.addProjectIdea = asyncHandler(async (req, res) => {
  const { title, description, teacherName } = req.body;
  await ProjectIdea.create({ title, description, teacherName });
  res.status(201).json({ message: 'Project idea added successfully' });
});
