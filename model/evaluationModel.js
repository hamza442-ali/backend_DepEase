const mongoose = require('mongoose');

const EvaluationCriteriaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  weight: { type: Number, required: true },
  score: { type: Number, required: true },
});

const FYPProjectSchema = new mongoose.Schema({
  project_id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  teamMembers: [{ type: String, required: true }],
  teamlead_id: { type: String, required: true },
  supervisor: { type: String, required: true },
  evaluationCriteria: [EvaluationCriteriaSchema],
  presentation: {
    content: { type: Number, required: true },
    delivery: { type: Number, required: true },
    visuals: { type: Number, required: true },
  },
  innovation: { type: Number, required: true },
  technicalComplexity: { type: Number, required: true },
  implementation: { type: Number, required: true },
  documentation: { type: Number, required: true },
  collaboration: { type: Number, required: true },
  timeliness: { type: Number, required: true },
  overallScore: { type: Number, required: true },
});

const FYPProject = mongoose.model('FYPProject', FYPProjectSchema);

module.exports = FYPProject;
