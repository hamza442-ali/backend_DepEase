const multer = require('multer');

function documentUpload(req, res, next) {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: req.app.locals.uploadLimit,
      files: 1,
      fields: 10,
      fieldSize: 16384,
    },
  });
  upload.single('file')(req, res, next);
}

module.exports = { documentUpload };
