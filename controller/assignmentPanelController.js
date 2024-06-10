const Assignment = require("../model/panelAssignmentModel.js")
// Controller to get assignments by panelId
exports.getAssignments = async (req, res) => {
    
  
    try {
      const assignments = await Assignment.find();
  
      if (!assignments || assignments.length === 0) {
        return res.status(404).json({ message: 'Assignments not found for the given panelId.' });
      }
  
      res.status(200).json(assignments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };