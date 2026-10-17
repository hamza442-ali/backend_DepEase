const Document = require('../models/document.model');
const storage = require('../integrations/cloudinary/storage');
const { HttpError } = require('../errors/http-error');

async function uploadDocument({ buffer, filename, projectId }) {
  if (!buffer) throw new HttpError(400, 'A file is required');
  if (
    typeof filename !== 'string' ||
    !filename.trim() ||
    typeof projectId !== 'string' ||
    !projectId.trim()
  ) {
    throw new HttpError(400, 'Filename and ProjectId are required');
  }

  const uploaded = await storage.uploadDocument(buffer);
  try {
    return await Document.create({
      public_id: uploaded.public_id,
      url: uploaded.secure_url,
      filename,
      ProjectId: projectId,
      resource_type: uploaded.resource_type,
    });
  } catch (error) {
    try {
      await storage.deleteDocument(uploaded.public_id, uploaded.resource_type);
    } catch {
      console.error('Failed to clean up a document upload');
    }
    throw error;
  }
}

async function deleteDocument(id) {
  const document = await Document.findById(id);
  if (!document) throw new HttpError(404, 'File not found');

  const result = await storage.deleteDocument(
    document.public_id,
    document.resource_type || 'image',
  );
  if (!['ok', 'not found'].includes(result.result)) {
    throw new HttpError(502, 'Document deletion failed');
  }
  await document.deleteOne();
}

function listProjectDocuments(projectId) {
  return Document.find({ ProjectId: projectId });
}

module.exports = { uploadDocument, deleteDocument, listProjectDocuments };
