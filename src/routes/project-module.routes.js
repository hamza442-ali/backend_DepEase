const { Router } = require('express');
const moduleController = require('../controllers/project-module.controller');

const router = Router();

router.post('/add', moduleController.createModule);

router.get('/getall', moduleController.getModules);

router.get('/getmine/:projectId', moduleController.listProjectModules);

router.put('/update/:id', moduleController.updateModule);

router.delete('/delete/:id', moduleController.deleteModule);

module.exports = router;
