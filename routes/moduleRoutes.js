const express = require('express');
const router = express.Router();
const moduleController = require('../controller/moduleController');

// Create a new module
router.post('/modules', moduleController.createModule);

// Get all modules
router.get('/modules', moduleController.getModules);

// Get a specific module by ID
router.get('/modules/:id', moduleController.getModuleById);

// Update a module by ID
router.put('/modules/:id', moduleController.updateModule);

// Delete a module by ID
router.delete('/modules/:id', moduleController.deleteModule);

module.exports = router;
