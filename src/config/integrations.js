const { HttpError } = require('../errors/http-error');

function cloudinarySettings(env = process.env) {
  return {
    cloud_name: env.CLOUDINARY_NAME || env.Cloudinary_NAME,
    api_key: env.CLOUDINARY_KEY || env.Cloudinary_KEY,
    api_secret: env.CLOUDINARY_SECRET || env.Cloudinary_SECRET,
  };
}

function smtpSettings(env = process.env) {
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM) {
    throw new HttpError(503, 'Email integration is not configured');
  }

  const port = Number(env.SMTP_PORT || 587);
  return {
    from: SMTP_FROM,
    transport: {
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
      connectionTimeout: 10000,
      socketTimeout: 20000,
    },
  };
}

function jenkinsSettings(env = process.env) {
  const token = env.JENKINS_BRIDGE_TOKEN;
  if (!token || token.length < 32) {
    throw new HttpError(503, 'Jenkins integration is not configured');
  }

  return {
    baseURL: env.JENKINS_BRIDGE_URL || 'http://127.0.0.1:5000',
    timeout: 45000,
    headers: { 'X-Bridge-Token': token },
  };
}

module.exports = { cloudinarySettings, smtpSettings, jenkinsSettings };
