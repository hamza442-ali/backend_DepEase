const Model = require('../model/projectIdeasModel');
const { crud } = require('../src/crud');
const { asyncHandler } = require('../src/http');
const handlers = crud(Model, 'Project idea');

exports.getAllProjectIdeas = handlers.list();
exports.addProjectIdea = asyncHandler(async (req, res) => {
  const { title, description, teacherName } = req.body;
  await Model.create({ title, description, teacherName });
  res.status(201).json({ message: 'Project idea added successfully' });
});
