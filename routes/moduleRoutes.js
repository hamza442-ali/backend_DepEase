const express = require('express');
const router = express.Router();
const moduleController = require('../controller/moduleController');

// Create a new module
router.post('/add', moduleController.createModule);

// Get all modules
router.get('/getall', moduleController.getModules);

// Get a specific module by ID
router.get('/getmine/:projectId', moduleController.getModuleById);

// Update a module by ID
router.put('/update/:id', moduleController.updateModule);

// Delete a module by ID
router.delete('/delete/:id', moduleController.deleteModule);

module.exports = router;
