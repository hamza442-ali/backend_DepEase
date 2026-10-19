const { Router } = require('express');
const controller = require('../controllers/document.controller');
const { documentUpload } = require('../middleware/document-upload');
const { validateInput } = require('../middleware/validate-input');

const router = Router();

router.post('/add', documentUpload, validateInput, controller.uploadFile);
router.delete('/delete/:id', controller.deleteFile);
router.get('/download/:id', controller.downloadFile);
router.get('/getmine/:projectId', controller.getFilesByProjectId);

module.exports = router;
