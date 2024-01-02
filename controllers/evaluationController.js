const Evaluation = require("../models/evalutaionModel");

// Controller function for creating a new evaluation
const createEvaluation = async (req, res) => {

  console.log("creating evaluation", req.body)
  try {
    const evaluation = await Evaluation.create(req.body);
    res.status(200).json(evaluation);
  } catch (error) {
    console.log("Evaluation Error", error)
    res.status(500).json({ error: "Failed to create evaluation" });
  }
};

// getall ecaluations 
const getAllEvaluations = async (req, res) => {
  try {

    console.log(" getting all evaluations")
    const evaluations = await Evaluation.find();
    console.log(evaluations)
    res.json(evaluations);
  } catch (error) {
    console.log(error, "Error displaying")
    res.status(500).json({ error: "Failed to fetch evaluations" });
  }
};

//  delete
const deleteEvaluation = async (req, res) => {
  try {

    // const evaluation = await Evaluation.findByIdAndDelete(req.params.id);
    console.log(req.params.id, " ")
    const evaluation = await Evaluation.deleteOne({ _id: req.params.id });

    if (evaluation) {
      res.json({ message: "Evaluation deleted successfully" });
    } else {
      res.status(404).json({ error: "Evaluation not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete evaluation" });
  }
};

// // Controller function for getting single evaluation
// const getEvaluationById = async (req, res) => {
//   try {
//     const evaluation = await Evaluation.findById(req.params.id);
//     if (evaluation) {
//       res.json(evaluation);
//     } else {
//       res.status(404).json({ error: "Evaluation not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch evaluation" });
//   }
// };

// // update
const updateEvaluation = async (req, res) => {
  try {

    console.log(   req.params.id, " ", req.body)
    const evaluation = await Evaluation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (evaluation) {
      res.json(evaluation);
    } else {
      res.status(404).json({ error: "Evaluation not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update evaluation" });
  }
};

module.exports = {
  createEvaluation, 
  getAllEvaluations,
  deleteEvaluation,
  // getEvaluationById,
  updateEvaluation,
};
