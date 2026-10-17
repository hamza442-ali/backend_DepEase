const express = require('express');
const multer = require('multer');
const { validateInput } = require('../src/http');
const controller = require('../controller/documentController');
const router = express.Router();
router.post('/add', (req, res, next) => {
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: req.app.locals.uploadLimit, files: 1, fields: 10, fieldSize: 16384 } });
  upload.single('file')(req, res, next);
}, validateInput, controller.uploadFile);
router.delete('/delete/:id', controller.deleteFile);
router.get('/getmine/:projectId', controller.getFilesByProjectId);
module.exports = router;
