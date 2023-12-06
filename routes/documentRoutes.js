// fileRoutes.js

const express = require('express');
const router = express.Router();
const fileController = require('../controller/documentController');
const multer = require('multer');


// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// POST route to upload a file to Cloudinary
router.post('/add', upload.single('file'), fileController.uploadFile);

// DELETE route to delete a file from Cloudinary
router.delete('/delete/:id', fileController.deleteFile);


// GET route to retrieve files by ProjectId
router.get('/getmine/:projectId', fileController.getFilesByProjectId);

module.exports = router;
