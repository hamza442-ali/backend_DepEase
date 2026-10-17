const cloudinary = require('cloudinary').v2;
const { cloudinarySettings } = require('../../config/integrations');
const { HttpError } = require('../../errors/http-error');

function configureStorage(env = process.env) {
  cloudinary.config(cloudinarySettings(env));
}

function uploadDocument(buffer) {
  const { cloud_name, api_key, api_secret } = cloudinary.config();
  if (!cloud_name || !api_key || !api_secret) {
    throw new HttpError(503, 'Document integration is not configured');
  }

  return new Promise((resolve, reject) => {
    const options = { folder: 'depease', resource_type: 'auto', timeout: 30000 };
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    stream.end(buffer);
  });
}

function deleteDocument(publicId, resourceType = 'image') {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

module.exports = { configureStorage, uploadDocument, deleteDocument };
