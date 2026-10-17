const { verifyAccessToken } = require('../security/tokens');
const { HttpError } = require('../errors/http-error');

function authentication(config) {
  return function authenticateRequest(req, res, next) {
    const match = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization || '');
    if (!match) return next(new HttpError(401, 'Token required'));

    try {
      req.user = verifyAccessToken(match[1], config);
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = { authentication };
