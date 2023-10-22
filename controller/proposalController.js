const Proposal = require('../models/proposalModel');

// Controller for creating a new proposal
exports.createProposal = async (req, res) => {
  try {
    const proposal = new Proposal(req.body);
    await proposal.save();
    res.status(201).json(proposal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for fetching all proposals
exports.getProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find().populate('modules');
    res.status(200).json(proposals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for fetching a specific proposal by ID
exports.getProposalById = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate('modules');
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.status(200).json(proposal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for updating a proposal by ID
exports.updateProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.status(200).json(proposal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for deleting a proposal by ID
exports.deleteProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findByIdAndDelete(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.status(200).json({ message: 'Proposal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
