const { Router } = require('express');
const proposalController = require('../controllers/proposal.controller');

const router = Router();

router.post('/add', proposalController.createProposal);

router.get('/getall', proposalController.getProposals);

router.get('/getone/:id', proposalController.getProposalById);

router.put('/proposals/:id', proposalController.updateProposal);

router.delete('/delete/:id', proposalController.deleteProposal);

router.get('/getmine/:id', proposalController.getMineProposal);

module.exports = router;
