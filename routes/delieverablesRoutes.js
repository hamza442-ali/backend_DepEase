const express = require('express');
const router = express.Router();
const deliverableController = require('../controllers/deliverableController');

// Create a new deliverable
router.post('/deliverables', deliverableController.createDeliverable);

// Get all deliverables
router.get('/deliverables', deliverableController.getDeliverables);

// Get a specific deliverable by ID
router.get('/deliverables/:id', deliverableController.getDeliverableById);

// Update a deliverable by ID
router.put('/deliverables/:id', deliverableController.updateDeliverable);

// Delete a deliverable by ID
router.delete('/deliverables/:id', deliverableController.deleteDeliverable);

module.exports = router;
