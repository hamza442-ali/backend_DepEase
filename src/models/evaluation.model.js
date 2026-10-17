const mongoose = require('mongoose');

const EvaluationSchema = new mongoose.Schema({
  totalWeightage: {
    type: Number,
    required: true,
  },

  fields: [
    {
      name: {
        type: String,
        required: true,
      },
      weightage: {
        type: Number,
        required: true,
      },
    },
  ],

  evaluationType: {
    type: String,
    required: true,
  },
  obtainedMarks: {
    type: Number,
    default: 0,
  },
});

const Evaluation = mongoose.model('Evaluation', EvaluationSchema);
module.exports = Evaluation;
