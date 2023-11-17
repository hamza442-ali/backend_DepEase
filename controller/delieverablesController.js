const Deliverable = require('../model/delieverableModel');
const Module = require('../model/moduleModel');
const mongoose = require('mongoose');
// Controller for creating a new deliverable
exports.createDeliverable = async (req, res) => {
  try {
    const {  projectId,name, status, deadline, modules } = req.body;
    const deliverable = new Deliverable({
      projectId,
      name,
      status,
      deadline,
      modules,
    });
    await deliverable.save();
    res.status(201).json(deliverable);
  } catch (error) {
    // res.status(500).json({ error: error.message });
    console.log(error);
  }
};

// Controller for fetching all deliverables
exports.getDeliverables = async (req, res) => {
  try {
    const deliverables = await Deliverable.find().populate('modules');
    res.status(200).json(deliverables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for fetching a specific deliverable by ID
exports.getDeliverableById = async (req, res) => {
  const { projectId } = req.params;
  try {
    const deliverable = await Deliverable.find({ projectId });
    if (!deliverable) {
      return res.status(404).json({ error: 'Deliverable not found' });
    }
    res.status(200).json(deliverable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for updating a deliverable by ID
exports.updateDeliverable = async (req, res) => {
  const { id } = req.params;

  try {
    // Validate incoming data if needed

    // Perform the update and get the updated deliverable
    const deliverable = await Deliverable.findByIdAndUpdate(id, req.body, { new: true });

    // Check if the deliverable is not found
    if (!deliverable) {
      return res.status(404).json({ error: 'Deliverable not found' });
    }

    // Send the updated deliverable as the response
    res.status(200).json(deliverable);
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error updating deliverable:', error);

    // Send an error response to the client
    res.status(500).json({ error: error.message });
  }
};

// Controller for deleting a deliverable by ID
exports.deleteDeliverable = async (req, res) => {
  const { id } = req.params;
  try {
    const deliverable = await Deliverable.findByIdAndDelete(id);
    if (!deliverable) {
      return res.status(404).json({ error: 'Deliverable not found' });
    }
    res.status(200).json({ message: 'Deliverable deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};



// Controller to handle adding a module to a deliverable
exports.addModuleToDeliverable = async (req, res) => {
  try {
    const { moduleId, deliverableId } = req.body;


    // Validate if the module and deliverable exist
    const module = await Module.findById(moduleId); 
    const deliverable = await Deliverable.findById(deliverableId);

    if (!module || !deliverable) {
      return res.status(404).json({ message: 'Module or deliverable not found' });
    }

    // Add the module to the deliverable
    deliverable.modules.push(moduleId); // Use module._id directly as it's already an ObjectId

    // Save the updated deliverable
    await deliverable.save();

    res.status(200).json(deliverable);
  } catch (error) {
    console.error('Error adding module to deliverable:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};





// Controller to handle removing a module from a deliverable
exports.removeModuleFromDeliverable = async (req, res) => {
  try {
    const { moduleId, deliverableId } = req.params;

    // Validate if the deliverable exists
    const deliverable = await Deliverable.findById(deliverableId);

    if (!deliverable) {
      return res.status(404).json({ message: 'Deliverable not found' });
    }

    // Remove the module from the deliverable
deliverable.modules = deliverable.modules.filter((module) => module.toString() !== moduleId.toString());

    // Save the updated deliverable
    await deliverable.save();

    res.status(200).json(deliverable);
  } catch (error) {
    console.error('Error removing module from deliverable:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
