const Panel = require("../model/fypPanelModel.js");


// Retrieve all Panels from the database.  
const getAllPanelsByTeacherId = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    
    // Using the Mongoose find method to get all panels where teacher.id matches the provided teacherId
    const panels = await Panel.find({'teachers.id': teacherId});

    if (!panels || panels.length === 0) {
      return res.status(404).json({ message: 'No panels found for the given teacherId' });
    }

    res.status(200).json(panels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllPanelsByTeacherId,
};


