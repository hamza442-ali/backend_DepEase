const mongoose = require('mongoose');

// Define the SuperAnnouncement Schema
const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  TeacherId: {
    type: String,
    required: true,
  },
  ProjectId:{
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Create the SuperAnnouncement Model
const SuperAnnouncement = mongoose.model('SuperAnnouncement', announcementSchema);

// Export the model for use in other parts of your application
module.exports = SuperAnnouncement;
