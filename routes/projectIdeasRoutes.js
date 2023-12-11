const express = require('express');
const router = express.Router();
const projectIdeasController = require('../controller/projectIdeasController');

// Fetch all project ideas
router.get('/getall', projectIdeasController.getAllProjectIdeas);

// Add a new project idea
router.post('/add', projectIdeasController.addProjectIdea);

module.exports = router;
