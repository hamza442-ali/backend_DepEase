const express = require('express');
const router = express.Router();
const deliverableController = require('../controller/delieverablesController');

// Create a new deliverable
router.post('/add', deliverableController.createDeliverable);

// Get all deliverables
router.get('/getall', deliverableController.getDeliverables);

// Get a specific deliverable by project ID
router.get('/getmine/:projectId', deliverableController.getDeliverableById);

// Update a deliverable by ID
router.put('/update/:id', deliverableController.updateDeliverable);

// Delete a deliverable by ID
router.delete('/delete/:id', deliverableController.deleteDeliverable);

router.post('/addModuleToDeliverable', deliverableController.addModuleToDeliverable);

// DELETE request to remove a module from a deliverable
router.delete('/removeModuleFromDeliverable/:moduleId/:deliverableId', deliverableController.removeModuleFromDeliverable);


module.exports = router;
