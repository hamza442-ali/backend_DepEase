const express = require("express");
const mongoose = require("mongoose");
 const upload= require("express-fileupload");
const cors = require("cors");
const dotenv = require("dotenv").config();



// const router1  = require("./Routes/JobRoutes.js");
 const teamMemberRoutes  = require("./routes/teamMemberRoutes.js");
const requirementRoutes = require("./routes/requirementsRoute.js");
const emailRoutes  = require("./routes/emailRoutes.js");
const evalRoutes = require("./routes/evaluationRoutes.js")


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


app.use('/requirements', requirementRoutes);
 app.use("/email", emailRoutes);
 app.use("/teamMember", teamMemberRoutes);
app.use("/evaluation", evalRoutes);


const jwt = require('jsonwebtoken');

app.post('/login', (req, res) => {
  // Retrieve user credentials from request body
  const { email, password } = req.body;

  // Verify user credentials
  if (email == 'axiomshah@gmail.com' && password == 'Abc1234!') {
    // Create a JWT with user information
    const token = jwt.sign({ email }, secretKey);

    // Send the JWT as a response
    res.json({ token });
  } else {
    // Return an error if credentials are invalid
    res.status(401).json({ error: 'Invalid credentials' });
  }
});



function authenticateToken(req, res, next) {
    // Retrieve JWT from request header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    // Return an error if JWT is not provided
    if (token == null) return res.status(401).json({ error: 'JWT required' });
  
    // Verify JWT and extract user information
    jwt.verify(token, secretKey, (err, user) => {
      if (err) return res.status(403).json({ error: 'Invalid JWT' });
  
      // Save user information in request object for future use
     // req.user = user;
      next();
    });
  }
  

  app.get('/op', authenticateToken, (req, res) => {
    // Access user information from request object
    const { email } = req.user;
 
    // Return user-specific data
    res.json( { "email": "abdullah" } );
  });
  

  app.get('/', (req, res) => {
 res.send("welcome")
  });
