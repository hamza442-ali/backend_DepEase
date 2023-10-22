const express = require('express');
const router = express.Router();
const projectIdeaController = require('../controllers/projectIdeaController');

// Create a new project idea
router.post('/project-ideas', projectIdeaController.createProjectIdea);

// Get all project ideas
router.get('/project-ideas', projectIdeaController.getProjectIdeas);

// Get a specific project idea by ID
router.get('/project-ideas/:id', projectIdeaController.getProjectIdeaById);

// Update a project idea by ID
router.put('/project-ideas/:id', projectIdeaController.updateProjectIdea);

// Delete a project idea by ID
router.delete('/project-ideas/:id', projectIdeaController.deleteProjectIdea);

module.exports = router;
