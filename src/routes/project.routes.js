const { Router } = require('express');
const router = Router();
const projectController = require('../controllers/project.controller');

router.post('/add', projectController.createProject);
router.get('/getall', projectController.getAllProject);

router.get('/getmine/:id', projectController.getMineProject);

router.get('/getallmine/:teacher', projectController.getAllMineProject);

router.get('/getone/:group', projectController.getProjectBygroup);

router.put('/update/:projectId', projectController.updateProjectById);

router.delete('/delete/:projectId', projectController.deleteProjectById);

module.exports = router;
