const express = require('express');
const router = express.Router();
const resourceRequestController = require('../controller/resourceRequestController');

// Create a new resource request
router.post('/add', resourceRequestController.createResourceRequest);

// Get all resource requests
router.get('/getall', resourceRequestController.getResourceRequests);

// get by project id
router.get('/getmine/:projectId', resourceRequestController.getResourceRequestsbyProjectid);

// Update a resource request by ID
router.put('/update/:id', resourceRequestController.updateResourceRequest);

// Delete a resource request by ID
router.delete('/delete/:id', resourceRequestController.deleteResourceRequest);

module.exports = router;
