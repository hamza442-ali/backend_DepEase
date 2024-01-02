const mongoose = require("mongoose");

// Define the schema for the EvaluationForm
const AddMarksSchema = new mongoose.Schema({
  ProjectId: {
    type: String,
    required: true,
  },
  evalFormId:{
    type: String,
    required: true,
  },

  TeacherId: {
    type: String,
    required: true,
  },
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
      Subobtain: {
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
  },
  Date: {
    type: Date,
    default: Date.now,
  },
  comments:{
    type:String,
    required:true,
  }
});

// Create a model based on the schema
const AddMarks = mongoose.model("AddMarks", AddMarksSchema);
module.exports = AddMarks;