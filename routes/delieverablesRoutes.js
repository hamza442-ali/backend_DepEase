const express = require('express');
const router = express.Router();
const deliverableController = require('../controller/delieverablesController');

// Create a new deliverable
router.post('/add', deliverableController.createDeliverable);

// Get all deliverables
router.get('/getall', deliverableController.getDeliverables);

// Get a specific deliverable by ID
router.get('/getone/:id', deliverableController.getDeliverableById);

// Update a deliverable by ID
router.put('/update/:id', deliverableController.updateDeliverable);

// Delete a deliverable by ID
router.delete('/delete/:id', deliverableController.deleteDeliverable);

module.exports = router;
