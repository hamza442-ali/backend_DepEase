const AddMarks = require('../model/addMarksModel');

// Controller for creating a new evaluation form
exports.createAddMarks = async (req, res) => {
  try {
    const formData = req.body;
    const newForm = new AddMarks(formData);
    await newForm.save();
    res.status(201).json(newForm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for fetching all evaluation forms
exports.getAllAddMarks = async (req, res) => {
  try {
    const addMarksList = await AddMarks.find();
    res.status(200).json(addMarksList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for fetching evaluation forms by ProjectId
exports.getAddMarksByProjectId = async (req, res) => {
  try {
    const { ProjectId } = req.params;
    const addMarksList = await AddMarks.find({ ProjectId });
    res.status(200).json(addMarksList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for updating an evaluation form by ID
exports.updateAddMarks = async (req, res) => {
    try {
      const { ProjectId } = req.params;
      const formData = req.body;

      // Find the document by ProjectId and update it
      const updatedForm = await AddMarks.findOneAndUpdate({ ProjectId }, formData, { new: true });
  
      
      if (!updatedForm) {
        return res.status(404).json({ error: 'Form not found' });
      }
  
      res.status(200).json(updatedForm);
    } catch (error) {
        console.log(error);
      res.status(500).json({ error: error.message });
    }
  };

// Controller for deleting an evaluation form by ID
exports.deleteAddMarks = async (req, res) => {
  try {
    const { id } = req.params;
    await AddMarks.findByIdAndDelete(id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
