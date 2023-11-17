const express = require('express');
const router = express.Router();
const projectController = require('../controller/projectController');

// Create a new project
router.post('/add', projectController.createProject);

// Get my proposal
router.get('/getmine/:id', projectController.getMineProject);

// Get a specific group by ID
router.get('/getone/:group', projectController.getProjectBygroup);

// Update a project by ID
router.put('/update/:projectId', projectController.updateProjectById);

// Delete a project by ID
router.delete('/delete/:projectId', projectController.deleteProjectById);

module.exports = router;
