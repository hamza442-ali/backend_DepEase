const documents = require('../services/document.service');
const { asyncHandler } = require('../utils/async-handler');
const { projectAccess, recordAccess } = require('../services/project-access.service');
const Document = require('../models/document.model');
const { localPath } = require('../integrations/documents/storage');
const { HttpError } = require('../errors/http-error');
const fs = require('node:fs/promises');

exports.uploadFile = asyncHandler(async (req, res) => {
  await projectAccess(req, req.body.ProjectId, { write: true });
  const document = await documents.uploadDocument({
    buffer: req.file?.buffer,
    filename: req.body.filename,
    projectId: req.body.ProjectId,
  });
  res.status(201).json(document);
});

exports.deleteFile = asyncHandler(async (req, res) => {
  await recordAccess(Document, req, req.params.id, true);
  await documents.deleteDocument(req.params.id);
  res.status(204).end();
});

exports.downloadFile = asyncHandler(async (req, res, next) => {
  const file = await recordAccess(Document, req, req.params.id);
  res.set('Cache-Control', 'private, no-store');
  if (file.provider !== 'local') return res.json({ url: file.url });
  const location = localPath(file.public_id);
  try {
    await fs.access(location);
  } catch {
    throw new HttpError(404, 'Stored file is unavailable');
  }
  res.type('application/octet-stream');
  res.download(location, file.filename, (error) => {
    if (error) next(error);
  });
});

exports.getFilesByProjectId = asyncHandler(async (req, res) => {
  await projectAccess(req, req.params.projectId);
  const documentsForProject = await documents.listProjectDocuments(req.params.projectId);
  const files = documentsForProject.map((document) => ({
    public_id: document.public_id,
    secure_url: document.url,
    filename: document.filename,
    ProjectId: document.ProjectId,
    _id: document._id,
    provider: document.provider,
  }));
  res.json({ files });
});
