const Model = require('../model/proposalModel');
const { crud } = require('../src/crud');
const handlers = crud(Model, 'Proposal');

exports.createProposal = handlers.create();
// Proposal modules are strings in the existing schema, not references to populate.
exports.getProposals = handlers.list();
exports.getProposalById = handlers.get();
exports.getMineProposal = handlers.get();
exports.updateProposal = handlers.update();
exports.deleteProposal = handlers.remove();
