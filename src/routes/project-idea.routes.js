const { staff } = require('../middleware/access');
const { Router } = require('express');
const router = Router();
const projectIdeasController = require('../controllers/project-idea.controller');

router.get('/getall', projectIdeasController.getAllProjectIdeas);

router.post('/add', staff, projectIdeasController.addProjectIdea);

module.exports = router;
