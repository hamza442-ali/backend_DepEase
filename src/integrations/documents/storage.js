const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const cloud = require('../cloudinary/storage');
const { HttpError } = require('../../errors/http-error');

function localPath(id) {
  if (!/^[0-9a-f-]{36}$/.test(id)) throw new HttpError(400, 'Invalid file identifier');
  return path.join(path.resolve(process.env.UPLOAD_DIR || 'data/uploads'), id);
}

async function uploadDocument(buffer) {
  const provider = process.env.DOCUMENT_STORAGE || 'local';
  if (provider === 'cloudinary') return { ...(await cloud.uploadDocument(buffer)), provider };
  if (provider !== 'local') throw new HttpError(503, 'Invalid document storage configuration');
  const id = randomUUID();
  const file = localPath(id);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, buffer, { flag: 'wx', mode: 0o600 });
  return { provider: 'local', public_id: id, secure_url: 'local:protected', resource_type: 'raw' };
}

async function deleteDocument(id, type, provider = 'cloudinary') {
  if (provider === 'cloudinary') return cloud.deleteDocument(id, type);
  if (provider !== 'local') throw new HttpError(503, 'Invalid stored file provider');
  try {
    await fs.unlink(localPath(id));
    return { result: 'ok' };
  } catch (error) {
    if (error.code === 'ENOENT') return { result: 'not found' };
    throw error;
  }
}

module.exports = { uploadDocument, deleteDocument, localPath };
