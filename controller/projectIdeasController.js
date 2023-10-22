const ProjectIdea = require('../models/projectIdeaModel');

// Controller for creating a new project idea
exports.createProjectIdea = async (req, res) => {
  try {
    const { ProjectIdeaId, IdeaTitle, Description, teacher } = req.body;
    const projectIdea = new ProjectIdea({
      ProjectIdeaId,
      IdeaTitle,
      Description,
      teacher,
    });
    await projectIdea.save();
    res.status(201).json(projectIdea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for fetching all project ideas
exports.getProjectIdeas = async (req, res) => {
  try {
    const projectIdeas = await ProjectIdea.find().populate('teacher');
    res.status(200).json(projectIdeas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for fetching a specific project idea by ID
exports.getProjectIdeaById = async (req, res) => {
  try {
    const projectIdea = await ProjectIdea.findById(req.params.id).populate('teacher');
    if (!projectIdea) {
      return res.status(404).json({ error: 'Project idea not found' });
    }
    res.status(200).json(projectIdea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for updating a project idea by ID
exports.updateProjectIdea = async (req, res) => {
  try {
    const projectIdea = await ProjectIdea.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!projectIdea) {
      return res.status(404).json({ error: 'Project idea not found' });
    }
    res.status(200).json(projectIdea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for deleting a project idea by ID
exports.deleteProjectIdea = async (req, res) => {
  try {
    const projectIdea = await ProjectIdea.findByIdAndDelete(req.params.id);
    if (!projectIdea) {
      return res.status(404).json({ error: 'Project idea not found' });
    }
    res.status(200).json({ message: 'Project idea deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
