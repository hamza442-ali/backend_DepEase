const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const panelSchema = new Schema({
  id: String,
  teachers: [
    {
      id: Number,
      name: String,
      panelHead: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

const Panel = mongoose.model("Panel", panelSchema);
module.exports = Panel;