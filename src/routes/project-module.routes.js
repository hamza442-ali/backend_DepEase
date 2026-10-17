const { Router } = require('express');
const router = Router();
const moduleController = require('../controllers/project-module.controller');

router.post('/add', moduleController.createModule);

router.get('/getall', moduleController.getModules);

router.get('/getmine/:projectId', moduleController.getModuleById);

router.put('/update/:id', moduleController.updateModule);

router.delete('/delete/:id', moduleController.deleteModule);

module.exports = router;
