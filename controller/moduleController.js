const Module = require('../model/moduleModel');

// Controller for creating a new module
exports.createModule = async (req, res) => {
  try {
    const { projectId, name, status, details } = req.body;
    console.log(req.body);
    const module = new Module({
      projectId,
      name,
      status,
      details,
    });
    await module.save();
    res.status(201).json(module);
  } catch (error) {
   res.status(500).json({ error: error.message });
   
  }
};

// Controller for fetching all modules
exports.getModules = async (req, res) => {
  try {
    const modules = await Module.find();
    res.status(200).json(modules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for fetching a specific module by ID
exports.getModuleById = async (req, res) => {
  const { projectId } = req.params;
  try {
    const module = await Module.find({ projectId });
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }
    res.status(200).json(module);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Controller for updating a module by ID
exports.updateModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }
    res.status(200).json(module);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for deleting a module by ID
exports.deleteModule = async (req, res) => {
  const { id } = req.params;
  try {
    const module = await Module.findByIdAndDelete(id);
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }
    res.status(200).json({ message: 'Module deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
