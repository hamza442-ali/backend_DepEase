const Project = require('../model/projectModel'); 

// Controller to create a new project
const createProject = async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// Controller to get all projects
const getMineProject = async (req, res) => {
  const { id } = req.params;
  try {
    const projects = await Project.findById(id);
    res.status(200).json(projects);
  } catch (error) {
  console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// Controller to get a specific project by ID
const getProjectBygroup = async (req, res) => {
  try {
    const { group } = req.params;
    
    const projects = await Project.find({group});
    if (!projects) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
    // console.log(error);
  }
};

// Controller to update a project by ID
const updateProjectById = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.projectId, req.body, { new: true });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller to delete a project by ID
const deleteProjectById = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createProject,
  getMineProject,
  getProjectBygroup,
  updateProjectById,
  deleteProjectById,
};
