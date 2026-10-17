// File.js

const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  resource_type: { type: String, enum: ['image', 'video', 'raw'], default: 'image' },
  public_id: {
    type: String,
    required: true,
    unique: true,
  },
  url: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  ProjectId: {
    type: String,
    required: true,
  },
});

const File = mongoose.model('File', fileSchema);

module.exports = File;
