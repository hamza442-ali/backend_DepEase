const Deliverable = require('../models/deliverableModel');

// Controller for creating a new deliverable
exports.createDeliverable = async (req, res) => {
  try {
    const { deliverableId, name, status, deadline, modules } = req.body;
    const deliverable = new Deliverable({
      deliverableId,
      name,
      status,
      deadline,
      modules,
    });
    await deliverable.save();
    res.status(201).json(deliverable);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  try {
    const deliverable = await Deliverable.findById(req.params.id).populate('modules');
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
  try {
    const deliverable = await Deliverable.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!deliverable) {
      return res.status(404).json({ error: 'Deliverable not found' });
    }
    res.status(200).json(deliverable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for deleting a deliverable by ID
exports.deleteDeliverable = async (req, res) => {
  try {
    const deliverable = await Deliverable.findByIdAndDelete(req.params.id);
    if (!deliverable) {
      return res.status(404).json({ error: 'Deliverable not found' });
    }
    res.status(200).json({ message: 'Deliverable deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
