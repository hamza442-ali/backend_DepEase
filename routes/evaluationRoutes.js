const express = require('express');
const router = express.Router();
const FYPProjectController = require('../controller/fypEvalluation.js');

// Create a new FYP project
router.post('/createval', FYPProjectController.createFYPProject);

// Update an existing FYP project
router.put('/updateeval/:id', FYPProjectController.updateFYPProject);

router.get('/geteval', FYPProjectController.getAllEvaluation );

module.exports = router;
