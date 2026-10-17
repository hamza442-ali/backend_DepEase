const Proposal = require('../models/proposal.model');
const { createCrudHandlers } = require('./crud-handlers');
const handlers = createCrudHandlers(Proposal, 'Proposal');

exports.createProposal = handlers.create();
// Proposal modules are strings in the existing schema, not references to populate.
exports.getProposals = handlers.list();
exports.getProposalById = handlers.get();
exports.getMineProposal = handlers.get();
exports.updateProposal = handlers.update();
exports.deleteProposal = handlers.remove();
