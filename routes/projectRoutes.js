const express = require('express');
const router = express.Router();
const projectController = require('../controller/projectController');

// Create a new project
router.post('/', projectController.createProject);

// Get all projects
router.get('/', projectController.getAllProjects);

// Get a specific project by ID
router.get('/:projectId', projectController.getProjectById);

// Update a project by ID
router.put('/:projectId', projectController.updateProjectById);

// Delete a project by ID
router.delete('/:projectId', projectController.deleteProjectById);

module.exports = router;
