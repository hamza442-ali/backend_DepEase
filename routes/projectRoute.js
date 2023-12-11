const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController')

// Create a new project
router.post('/add', projectController.createProject);

// Get my projects
router.get('/getmine/:id', projectController.getMineProject);

// get all teachers 
router.get('/getall', projectController.getAllProject);

// Get projects of teachers
router.get('/getallmine/:teacher', projectController.getAllMineProject);

// Get a specific group by ID
router.get('/getone/:group', projectController.getProjectBygroup);

// Update a project by ID
router.put('/update/:projectId', projectController.updateProjectById);

// Delete a project by ID
router.delete('/delete/:projectId', projectController.deleteProjectById);

module.exports = router;