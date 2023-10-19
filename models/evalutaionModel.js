const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EvaluationSchema = new Schema({
  projectId: {
    type: String,
    required: true,
  },
  studentId: {
    type: String,
    required: true,
  },
  criteria: {
    type: String,
    required: true,
  },
  totalScore: {
    type: Number,
    required: true,
  },
  obtainedScore: {
    type: Number,
    required: true,
  },
  comments: {
    type: String,
    required: true,
  },
  evaluationDate: {
    type: Date,
    default: Date.now,
  },
  progress: {
    type: Number,
    required: true,
  },
});

const Evaluation = mongoose.model("Evaluation", EvaluationSchema);
module.exports = Evaluation;
