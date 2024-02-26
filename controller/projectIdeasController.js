const ProjectIdea = require('../model/projectIdeasModel');

// Controller to fetch all project ideas
exports.getAllProjectIdeas = async (req, res) => {
  try {
    const projectIdeas = await ProjectIdea.find();
    res.json(projectIdeas);
  } catch (error) {
    console.error('Error fetching project ideas:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Controller to add a new project idea
exports.addProjectIdea = async (req, res) => {
  const { title, description, teacherName } = req.body;
  
  try {
    const newProjectIdea = new ProjectIdea({ title, description, teacherName });
    await newProjectIdea.save();
    res.status(201).json({ message: 'Project idea added successfully' });
  } catch (error) {
    console.error('Error adding project idea:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
