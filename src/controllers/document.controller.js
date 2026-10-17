const documents = require('../services/document.service');
const { asyncHandler } = require('../utils/async-handler');

exports.uploadFile = asyncHandler(async (req, res) => {
  const document = await documents.uploadDocument({
    buffer: req.file?.buffer,
    filename: req.body.filename,
    projectId: req.body.ProjectId,
  });
  res.status(201).json(document);
});

exports.deleteFile = asyncHandler(async (req, res) => {
  await documents.deleteDocument(req.params.id);
  res.status(204).end();
});

exports.getFilesByProjectId = asyncHandler(async (req, res) => {
  const documentsForProject = await documents.listProjectDocuments(req.params.projectId);
  const files = documentsForProject.map((document) => ({
    public_id: document.public_id,
    secure_url: document.url,
    filename: document.filename,
    ProjectId: document.ProjectId,
    _id: document._id,
  }));
  res.json({ files });
});
