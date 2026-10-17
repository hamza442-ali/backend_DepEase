const express = require('express');
const router = express.Router();
const projectIdeasController = require('../controllers/project-idea.controller');

// Fetch all project ideas
router.get('/getall', projectIdeasController.getAllProjectIdeas);

// Add a new project idea
router.post(
  '/add',
  require('../middleware/authorize-roles').requireRoles('teacher', 'admin'),
  projectIdeasController.addProjectIdea,
);

module.exports = router;
