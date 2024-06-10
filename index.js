const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv").config();
const bodyParser = require('body-parser');
const cloudinary = require('cloudinary').v2;
const Student = require('./model/studentModel.js');
const Teacher=require('./model/teacherModel.js');
// const router1  = require("./Routes/JobRoutes.js");
 const teamMemberRoutes  = require("./routes/teamMemberRoutes.js");
const requirementRoutes = require("./routes/requirementsRoute.js");
const emailRoutes  = require("./routes/emailRoutes.js");
const delieverablesRoutes = require("./routes/delieverablesRoutes.js")
const groupRoutes  = require("./routes/groupRoutes.js");
const moduleRoutes  = require("./routes/moduleRoutes.js");
const projectRoutes  = require("./routes/projectRoutes.js");
const proposalRoutes  = require("./routes/proposalRoutes.js");
const taskRoutes = require("./routes/taskRoutes.js");
const resourceRequestRoutes = require("./routes/resourceRequestRoutes.js");
const studentRoutes = require("./routes/studentRoutes.js");
const teacherRoutes = require("./routes/teacherRoutes.js");
const documentRoutes = require('./routes/documentRoutes');
const projectIdeaRoutes = require('./routes/projectIdeasRoutes.js');
const fypPanelRoutes = require('./routes/fypPanelRoutes.js');
const annoucementRoutesS = require('./routes/announcement_S_Routes.js');
const annoucementRoutesA = require('./routes/announcement_A_Routes.js');
const evalRoutes = require("./routes/evaluationRoutes.js")
const addMarks = require("./routes/addMarksRoutes.js")
const schedule = require('./routes/schedulingRoutes.js');
const assignmentPanelRoutes = require('./routes/assignmentPanelRoutes.js');
const jenkinsController = require('./routes/jenkinsRoutes.js');


const app = express();
const port = process.env.PORT || 3001;
const dbURI = process.env.ATLAS_URI;
const secretKey= process.env.SECRET_KEY;



mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to database");
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });    

app.use(cors());
app.use(express.json());
// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


cloudinary.config({
  cloud_name: process.env.Cloudinary_NAME,
  api_key: process.env.Cloudinary_KEY,
  api_secret: process.env. Cloudinary_SECRET,
});




const jwt = require('jsonwebtoken');

app.post ('/login', async (req, res) => {
  const { email_address, password } = req.body;
  try {
    const student = await Student.findOne({ email_address, password });
    // Verify user credentials
  if (student) {
    // Create a JWT with user information
    const token = jwt.sign({ email_address }, secretKey);

    // Include the token in the JSON response
res.status(200).json({
  student: student,
  token: token,
});
  } else {
    // Return an error if credentials are invalid
    res.status(401).json({ error: 'Invalid credentials' });
  }  
  } catch (error) {
    res.status(401).json({ error: error.message });
  }

  
});


app.post ('/loginT', async (req, res) => {
  const { email, passoword } = req.body;
 
  try {
    const teacher = await Teacher.findOne({ email, passoword });
    // Verify user credentials
  if (teacher) {
    // Create a JWT with user information
    const token = jwt.sign({ email }, secretKey);

    // Include the token in the JSON response
res.status(200).json({
  teacher: teacher,
  token: token,
});
  } else {
    // Return an error if credentials are invalid
    res.status(401).json({ error: 'Invalid credentials' });
  }  
  } catch (error) {
    res.status(401).json({ error: error.message });
  }

  
});



// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token Required' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    // req.user = user;
    next();
  });
};
  

  app.get('/', (req, res) => {
 res.send("welcome")
  });





app.use('/requirements',authenticateToken, requirementRoutes);
app.use('/email', authenticateToken, emailRoutes);
app.use('/teamMember', authenticateToken,teamMemberRoutes);
app.use('/deliverables', authenticateToken,delieverablesRoutes);
app.use('/group', authenticateToken,groupRoutes);
app.use('/modules',authenticateToken, moduleRoutes);
app.use('/projects',authenticateToken, projectRoutes);
app.use('/proposals',authenticateToken, proposalRoutes);
app.use('/tasks', authenticateToken,taskRoutes);
app.use('/resource',authenticateToken,  resourceRequestRoutes);
app.use('/student',authenticateToken, studentRoutes);
app.use('/teacher', authenticateToken,teacherRoutes);
app.use('/documents',authenticateToken, documentRoutes);
app.use('/projectIdea',authenticateToken, projectIdeaRoutes);
app.use('/fypPanel',authenticateToken, fypPanelRoutes);
app.use('/announcementS', authenticateToken,annoucementRoutesS);
app.use('/announcementA',authenticateToken, annoucementRoutesA);
app.use('/evaluation', authenticateToken,evalRoutes);
app.use('/addMarks',authenticateToken, addMarks);
app.use('/schedule',authenticateToken, schedule);
app.use('/assignmentPanel', authenticateToken,assignmentPanelRoutes);
app.use('/jenkins', jenkinsController);