
const express = require("express");
// const upload= require("express-fileupload");
const app= express();
const mongoose= require("mongoose");
const cors= require("cors");
const bodyParser = require('body-parser');
require('dotenv').config();
// const jwt = require('jsonwebtoken');



const panelRoutes = require('./routes/createPanelRoute');
const studentRoutes = require ('./routes/studentRoute');
const announcementRoute = require ('./routes/makeAnnouncementRoute') ;
const resourceRoutes = require ('./routes/resourceRequestRoute')
const teacher = require('./routes/teacherRoute')
const evaluation = require('./routes/evaluationRoute')
const project = require('./routes/projectRoute')
const scheduling = require('./routes/schedulingRoute')
const group = require ('./routes/groupRoute')
const addMarks = require('./routes/addMarksRoute')

// const gitLabAPIRoutes = require ('./routes/gitLabRepoAPIRoute.js');


const port= process.env.PORT ||  5001;


//middleware
app.use(cors());
app.use(bodyParser.json());
// app.use(upload());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use('/panel', panelRoutes);
app.use('/student', studentRoutes);
app.use('/announcement', announcementRoute)
app.use('/resource', resourceRoutes)
app.use('/teacher',teacher )
app.use('/evaluation', evaluation)
app.use('/project',project )
app.use('/scheduling', scheduling)
app.use('/group', group)
app.use('/addMarks', addMarks)

// app.use('/projects', projectRoutes);
// app.use('/deliverables', deliverableRoutes);
// app.use('/evaluations', evaluationRoutes);
// app.use('/users', userRoutes);

// Frontend deliver routes
// app.use ('/APIRoutes', gitLabAPIRoutes); 


// Connect to MongoDB
mongoose.connect(process.env.ATLAS_URI, {useNewUrlParser: true, useUnifiedTopology: true}).then(() =>{

        console.log("connected to mongoDB ");

}) .catch((error)=>{

    console.log("error connecting to mongoDB: ", error)
})


app.listen(port, ()=>{

    console.log(`Server listening on port ${port}`)
}); 