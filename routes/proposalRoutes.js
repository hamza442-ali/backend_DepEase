const express = require('express');
const router = express.Router();
const proposalController = require('../controller/proposalController');

// Create a new proposal
router.post('/add', proposalController.createProposal);

// Get all proposals
router.get('/getall', proposalController.getProposals);

// Get a specific proposal by ID
router.get('/getone/:id', proposalController.getProposalById);

// Update a proposal by ID
router.put('/proposals/:id', proposalController.updateProposal);

// Delete a proposal by ID
router.delete('/delete/:id', proposalController.deleteProposal);

module.exports = router;
