const { Router } = require('express');
const projectController = require('../controllers/project.controller');
const { asyncHandler } = require('../utils/async-handler');
const { submitProject } = require('../services/project-submission.service');

const router = Router();
router.post(
  '/submit-proposal',
  asyncHandler(async (req, res) => {
    res.status(201).json(await submitProject(req));
  }),
);

router.post('/add', projectController.createProject);
router.get('/getall', projectController.listProjects);

router.get('/getmine/:id', projectController.getProjectById);

router.get('/getallmine/:teacher', projectController.listProjectsByTeacher);

router.get('/getone/:group', projectController.listProjectsByGroup);

router.put('/update/:projectId', projectController.updateProject);

router.delete('/delete/:projectId', projectController.deleteProject);

module.exports = router;
