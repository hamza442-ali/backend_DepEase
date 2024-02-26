// models/Slot.js

const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  day: {
    type: String, 
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
   default:"Pending"
  },
});

const Slot = mongoose.model('Slot', slotSchema);

module.exports = Slot;