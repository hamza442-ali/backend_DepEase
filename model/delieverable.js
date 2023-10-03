const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deliverableSchema = new Schema({
  deliverableId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  modules: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
    },
  ],
});

const Deliverable = mongoose.model('Deliverable', deliverableSchema);

module.exports = Deliverable;
