
const mongoose = require("mongoose");

// Define the schema for the EvaluationForm
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
  obtainedMarks:{
    type: Number,
    default: 0
  
  }

});

// Create a model based on the schema
const Evaluation = mongoose.model("Evaluation", EvaluationSchema);
module.exports = Evaluation;