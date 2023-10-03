const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    accepted: {
      type: Boolean,
      default: false,
    },
    // Other proposal-related fields
  });
  

  const Proposal = mongoose.model('Proposal', proposalSchema);

module.exports = Proposal;
