const Evaluation = require("../model/evalutaionModel");

const getAllEvaluations = async (req, res) => {
  try {

   
    const evaluations = await Evaluation.find();
    console.log(evaluations)
    res.json(evaluations);
  } catch (error) {
    console.log(error, "Error displaying")
    res.status(500).json({ error: "Failed to fetch evaluations" });
  }
};


module.exports = { 
  getAllEvaluations,
};