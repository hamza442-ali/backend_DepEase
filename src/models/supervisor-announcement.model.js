const mongoose = require('mongoose');

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
  ProjectId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const SuperAnnouncement = mongoose.model('SuperAnnouncement', announcementSchema);

module.exports = SuperAnnouncement;
