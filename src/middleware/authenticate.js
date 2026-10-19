const { verifyAccessToken } = require('../security/tokens');
const { HttpError } = require('../errors/http-error');
const { asyncHandler } = require('../utils/async-handler');
const Student = require('../models/student.model');
const Teacher = require('../models/teacher.model');

function authentication(config) {
  return asyncHandler(async function authenticateRequest(req, res, next) {
    const match = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization || '');
    if (!match) return next(new HttpError(401, 'Token required'));

    try {
      req.user = verifyAccessToken(match[1], config);
      const Model = req.user.role === 'student' ? Student : Teacher;
      req.actor = await Model.findById(req.user.sub);
      const email = req.actor?.email_address || req.actor?.email;
      if (!email || email.toLowerCase() !== req.user.email)
        throw new HttpError(401, 'Account no longer available. Sign in again.');
      return next();
    } catch (error) {
      return next(error);
    }
  });
}

module.exports = { authentication };
