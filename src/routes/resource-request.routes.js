const express = require('express');
const router = express.Router();
const resourceRequestController = require('../controllers/resource-request.controller');

// Create a new resource request
router.post('/add', resourceRequestController.createResourceRequest);

// Get all resource requests
router.get('/getall', resourceRequestController.getResourceRequests);

// get by project id
router.get('/getmine/:projectId', resourceRequestController.getResourceRequestsbyProjectid);

// get by project id
router.get('/getbyteacherId/:TeacherId', resourceRequestController.getResourceRequestsbyTeacherid);

// Update a resource request by ID
router.put(
  '/update/:id',
  require('../middleware/authorize-roles').requireRoles('teacher', 'admin'),
  resourceRequestController.updateResourceRequest,
);

// Delete a resource request by ID
router.delete('/delete/:id', resourceRequestController.deleteResourceRequest);

module.exports = router;
