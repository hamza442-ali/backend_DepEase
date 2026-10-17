const { Router } = require('express');
const router = Router();
const requirementController = require('../controllers/requirement.controller');

router.post('/createRequirement', requirementController.createRequirement);

router.get('/getRequirements/:projectid', requirementController.getAllRequirements);

router.get('/findRequirement/:id', requirementController.getRequirementById);

router.put('/updateRequirement/:id', requirementController.updateRequirement);

router.delete('/deleteRequirement/:id', requirementController.deleteRequirement);

router.patch('/updatePriority/:id', requirementController.updatePriority);

router.patch('/updateDeadline/:id', requirementController.updateDeadline);

router.post('/uploadAttachment/:id', requirementController.uploadAttachment);

router.post('/addComment/:id', requirementController.addComment);

router.get('/getComments/:id', requirementController.getAllComments);

module.exports = router;
