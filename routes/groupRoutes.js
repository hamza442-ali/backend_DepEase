const express = require('express');
const router = express.Router();
const groupController = require('../controller/groupController');

// Create a new group
router.post('/add', groupController.createGroup);

// Get all groups
router.get('/getall', groupController.getGroups);

// Get a specific group by ID
router.get('/getone/:id', groupController.getGroupById);

// Update a group by ID
router.put('/update/:id', groupController.updateGroup);

// Delete a group by ID
router.delete('/delete/:id', groupController.deleteGroup);

module.exports = router;
