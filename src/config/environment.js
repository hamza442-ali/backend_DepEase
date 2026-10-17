function positiveInteger(value, fallback, name) {
  if (value === undefined || value === '') return fallback;
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return number;
}

function loadConfig(env = process.env) {
  const mongoUri = env.ATLAS_URI || env.MONGODB_URI;
  if (!mongoUri || !/^mongodb(?:\+srv)?:\/\//.test(mongoUri)) {
    throw new Error('Set ATLAS_URI or MONGODB_URI to a MongoDB connection string');
  }
  if (!env.SECRET_KEY || Buffer.byteLength(env.SECRET_KEY) < 32) {
    throw new Error('SECRET_KEY must contain at least 32 bytes');
  }
  const port = positiveInteger(env.PORT, 3001, 'PORT');
  if (port > 65535) throw new Error('PORT must not exceed 65535');
  const corsOrigins = (env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  for (const origin of corsOrigins) {
    const url = new URL(origin);
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin) {
      throw new Error('CORS_ORIGINS must contain exact HTTP(S) origins');
    }
  }
  return {
    mongoUri,
    port,
    secretKey: env.SECRET_KEY,
    corsOrigins,
    adminEmails: (env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
    tokenLifetime: '8h',
    bodyLimit: '1mb',
    uploadLimit: positiveInteger(env.UPLOAD_MAX_BYTES, 10 * 1024 * 1024, 'UPLOAD_MAX_BYTES'),
  };
}

module.exports = { loadConfig };
