const jwt = require('jsonwebtoken');
const { ROLES } = require('../constants/roles');
const { HttpError } = require('../errors/http-error');

const ISSUER = 'depease';
const AUDIENCE = 'depease-api';
const ALGORITHM = 'HS256';

function createAccessToken(accountId, role, email, config) {
  return jwt.sign({ role, email }, config.secretKey, {
    algorithm: ALGORITHM,
    subject: String(accountId),
    issuer: ISSUER,
    audience: AUDIENCE,
    expiresIn: config.tokenLifetime,
  });
}

function verifyAccessToken(token, config) {
  try {
    const user = jwt.verify(token, config.secretKey, {
      algorithms: [ALGORITHM],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (!user.sub || !Object.values(ROLES).includes(user.role)) throw new Error('Invalid claims');
    if (user.role === ROLES.ADMIN && !config.adminEmails.includes(user.email)) {
      throw new Error('Admin access revoked');
    }
    return user;
  } catch {
    throw new HttpError(401, 'Invalid or expired token');
  }
}

module.exports = { createAccessToken, verifyAccessToken };
