//make schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const announcementsSchema = new Schema({
   
    
    userId:{

        type: String,
        default: 'Admin'
    },
    title: {
        type: String,
        required: true
    },
    
    richText: {
        type: String,
        required: true
    }
    ,
    date:
    {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("announcement", announcementsSchema);