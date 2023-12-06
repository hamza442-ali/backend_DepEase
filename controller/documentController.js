// fileController.js


const File = require('../model/Document');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const uploadFile = async (req, res) => {
  try {
    const buffer = req.file.buffer;
    
    const uploadResult = await new Promise((resolve) => {
      cloudinary.uploader.upload_stream({ folder: 'your-folder' }, (error, uploadResult) => {
        if (error) {
          console.error(error);
          res.status(500).json({ error: 'Error uploading file to Cloudinary' });
        } else {
          resolve(uploadResult);
        }
      }).end(buffer);
    });

    const { public_id, secure_url, original_filename } = uploadResult;

    const newFile = new File({
      public_id,
      url: secure_url,
      filename: req.body.filename,
      ProjectId: req.body.ProjectId,
    });

    await newFile.save();

    res.status(201).json(newFile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const deleteFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = await File.findByIdAndDelete(fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    await cloudinary.uploader.destroy(file.public_id);

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



const getFilesByProjectId = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const files = await File.find({ ProjectId: projectId });
    

    const cloudinaryData = files.map(file => ({
      public_id: file.public_id, // Assuming public_id is stored in MongoDB
      secure_url: file.url,// Assuming URL is stored in MongoDB
      filename:file.filename,
       ProjectId: file.ProjectId,
       _id: file._id,
    }));

    res.status(200).json({ files: cloudinaryData });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { uploadFile, deleteFile, getFilesByProjectId };
