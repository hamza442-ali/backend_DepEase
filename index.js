const express = require("express");
const mongoose = require("mongoose");
 const upload= require("express-fileupload");
const cors = require("cors");
const dotenv = require("dotenv").config();
const Student = require('./model/studentModel.js');

// const router1  = require("./Routes/JobRoutes.js");
 const teamMemberRoutes  = require("./routes/teamMemberRoutes.js");
const requirementRoutes = require("./routes/requirementsRoute.js");
const emailRoutes  = require("./routes/emailRoutes.js");
const evalRoutes = require("./routes/evaluationRoutes.js")
const delieverablesRoutes = require("./routes/delieverablesRoutes.js")
const groupRoutes  = require("./routes/groupRoutes.js");
const moduleRoutes  = require("./routes/moduleRoutes.js");
const projectRoutes  = require("./routes/projectRoutes.js");
const proposalRoutes  = require("./routes/proposalRoutes.js");
const taskRoutes = require("./routes/taskRoutes.js");
const resourceRequestRoutes = require("./routes/resourceRequestRoutes.js");
const studentRoutes = require("./routes/studentRoutes.js");
const teacherRoutes = require("./routes/teacherRoutes.js");

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
app.use(upload());


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





app.use('/requirements', requirementRoutes);
app.use('/email', authenticateToken, emailRoutes);
app.use('/teamMember', authenticateToken, teamMemberRoutes);
app.use('/evaluation', authenticateToken, evalRoutes);
app.use('/deliverables', delieverablesRoutes);
app.use('/group', groupRoutes);
app.use('/modules', moduleRoutes);
app.use('/projects', projectRoutes);
app.use('/proposals', proposalRoutes);
app.use('/tasks', authenticateToken, taskRoutes);
app.use('/resource', authenticateToken, resourceRequestRoutes);
app.use('/student', studentRoutes);
app.use('/teacher', teacherRoutes);
