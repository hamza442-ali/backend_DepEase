

const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const panelSchema = new Schema({
  id: String,
  teachers: [
    {
      id: Number,
      name: String,
    },
  ],
});


const Proposal = mongoose.model('Panel', panelSchema);
module.exports = Proposal;