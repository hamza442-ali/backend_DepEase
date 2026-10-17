const File = require('../model/Document');
const cloudinary = require('cloudinary').v2;
const { asyncHandler, HttpError } = require('../src/http');
exports.uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'A file is required');
  if (typeof req.body.filename !== 'string' || !req.body.filename.trim() ||
      typeof req.body.ProjectId !== 'string' || !req.body.ProjectId.trim()) throw new HttpError(400, 'Filename and ProjectId are required');
  const config = cloudinary.config();
  if (!config.cloud_name || !config.api_key || !config.api_secret) throw new HttpError(503, 'Document integration is not configured');
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder: 'depease', resource_type: 'auto', timeout: 30000 }, (error, result) => {
      if (error) reject(error); else resolve(result);
    }).end(req.file.buffer);
  });
  let file;
  try {
    file = await File.create({ public_id: result.public_id, url: result.secure_url, filename: req.body.filename,
      ProjectId: req.body.ProjectId, resource_type: result.resource_type });
  } catch (error) {
    // Compensate a failed database write so the upload is not silently orphaned.
    try { await cloudinary.uploader.destroy(result.public_id, { resource_type: result.resource_type }); } catch {
      console.error('Failed to clean up a document upload');
    }
    throw error;
  }
  res.status(201).json(file);
});
exports.deleteFile = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file) throw new HttpError(404, 'File not found');
  const result = await cloudinary.uploader.destroy(file.public_id, { resource_type: file.resource_type || 'image' });
  if (!['ok', 'not found'].includes(result.result)) throw new HttpError(502, 'Document deletion failed');
  await file.deleteOne();
  res.status(204).end();
});
exports.getFilesByProjectId = asyncHandler(async (req, res) => {
  const files = await File.find({ ProjectId: req.params.projectId });
  res.json({ files: files.map(file => ({ public_id: file.public_id, secure_url: file.url, filename: file.filename,
    ProjectId: file.ProjectId, _id: file._id })) });
});
