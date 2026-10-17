const Scheduler = require('./Scheduler'); // Import the Scheduler model

// Create a new scheduler
exports.createScheduler = async (req, res) => {
  try {
    const scheduler = await Scheduler.create(req.body);
    res.status(201).json(scheduler);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get all schedulers
exports.getAllSchedulers = async (req, res) => {
  try {
    const schedulers = await Scheduler.find();
    res.status(200).json(schedulers);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get a specific scheduler by ID
exports.getSchedulerById = async (req, res) => {
  try {
    const scheduler = await Scheduler.findById(req.params.id);
    if (scheduler) {
      res.status(200).json(scheduler);
    } else {
      res.status(404).json({ error: 'Scheduler not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update a scheduler by ID
exports.updateSchedulerById = async (req, res) => {
  try {
    const scheduler = await Scheduler.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (scheduler) {
      res.status(200).json(scheduler);
    } else {
      res.status(404).json({ error: 'Scheduler not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete a scheduler by ID
exports.deleteSchedulerById = async (req, res) => {
  try {
    const scheduler = await Scheduler.findByIdAndDelete(req.params.id);
    if (scheduler) {
      res.status(200).json({ message: 'Scheduler deleted successfully' });
    } else {
      res.status(404).json({ error: 'Scheduler not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
