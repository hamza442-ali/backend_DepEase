const SchedulingModel = require('../model/schedulingModel');

// Route function to get all schedules
const getAll = async (req, res) => {
    SchedulingModel.find()
    .then((data) => {
       
        res.send(data);
    })
    .catch((err) => {
        res.status(500).send({ message: err.message || "Error Occurred" });
    });
};

// Route function to create a new schedule
const createSchedule = async (req, res) => {
  
    try {
        const { date, start, end, content, type, day } = req.body.data;

        // Create a new instance of the SchedulingModel with all fields specified
        const newSchedule = new SchedulingModel({
            date: date,
            start: start,
            end: end,
            content,
            type,
            day,
        });

        // Save the new schedule to the database
        await newSchedule.save();

        res.status(201).json(newSchedule);
    } catch (error) {
        console.log(error, " Error");
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// Route function to update an existing schedule
const updateSchedule = async (req, res) => {
    try {
        const updatedSchedule = await SchedulingModel.findByIdAndUpdate(req.params.id, req.body.selectedSlot);

        if (!updatedSchedule) {
            return res.status(404).json({ error: 'Schedule not found' });
          }
        res.status(200).json(updatedSchedule);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Route function to delete a schedule
const deleteSchedule = async (req, res) => {
    const { ids } = req.body;

   
    try {
      
      await SchedulingModel.deleteMany({ _id: { $in: ids } });
  
      res.status(200).json({ message: "Slots deleted successfully" });
    } catch (error) {
      console.error("Error deleting slots:", error);
      res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    getAll,
    createSchedule,
    updateSchedule,
    deleteSchedule,
};