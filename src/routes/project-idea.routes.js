const { staff } = require('../middleware/access');
const { Router } = require('express');
const projectIdeasController = require('../controllers/project-idea.controller');

const router = Router();

router.get('/getall', projectIdeasController.getAllProjectIdeas);

router.post('/add', staff, projectIdeasController.addProjectIdea);

module.exports = router;
