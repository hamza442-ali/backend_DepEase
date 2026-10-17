const { HttpError } = require('../errors/http-error');

function requireRoles(...roles) {
  return function authorizeRole(req, res, next) {
    if (!roles.includes(req.user?.role))
      return next(new HttpError(403, 'Insufficient permissions'));
    return next();
  };
}

module.exports = { requireRoles };
