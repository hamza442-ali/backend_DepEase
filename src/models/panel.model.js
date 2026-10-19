const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const panelSchema = new Schema({
  id: { type: String, required: true, unique: true, trim: true },
  teachers: [
    {
      employeeId: String,
      name: String,
      panelHead: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

const Panel = mongoose.model('Panel', panelSchema);
module.exports = Panel;
