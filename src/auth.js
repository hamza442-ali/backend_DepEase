const jwt = require('jsonwebtoken');
const Student = require('../model/studentModel');
const Teacher = require('../model/teacherModel');
const { HttpError, asyncHandler } = require('./http');
const { verifyPassword, PREFIX } = require('./passwords');

const JWT_OPTIONS = { algorithms: ['HS256'], issuer: 'depease', audience: 'depease-api' };

function authentication(config) {
  return (req, res, next) => {
    const match = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization || '');
    if (!match) return next(new HttpError(401, 'Token required'));
    try {
      const user = jwt.verify(match[1], config.secretKey, JWT_OPTIONS);
      if (!user.sub || !['student', 'teacher', 'admin'].includes(user.role)) throw new Error('Invalid claims');
      if (user.role === 'admin' && !config.adminEmails.includes(user.email)) throw new Error('Admin access revoked');
      req.user = user;
      next();
    } catch {
      next(new HttpError(401, 'Invalid or expired token'));
    }
  };
}

function requireRoles(...roles) {
  return (req, res, next) => roles.includes(req.user?.role)
    ? next() : next(new HttpError(403, 'Insufficient permissions'));
}

function login(config, teacher = false) {
  return asyncHandler(async (req, res) => {
    const email = teacher ? req.body.email : req.body.email_address;
    const password = teacher ? (req.body.password ?? req.body.passoword) : req.body.password;
    if (typeof email !== 'string' || !email.trim() || email.length > 254 ||
        typeof password !== 'string' || !password || password.length > 1024) {
      throw new HttpError(400, 'Email and password are required');
    }
    const Model = teacher ? Teacher : Student;
    const field = teacher ? 'passoword' : 'password';
    const emailField = teacher ? 'email' : 'email_address';
    const account = await Model.findOne({ [emailField]: email.trim() }).select(`+${field}`);
    if (!account || !(await verifyPassword(password, account[field]))) throw new HttpError(401, 'Invalid credentials');
    // Keep the existing database field names while upgrading plaintext credentials on login.
    if (!account[field].startsWith(PREFIX)) {
      if (password.length < 8) throw new HttpError(403, 'Ask an administrator to reset your password');
      account.markModified(field);
      await account.save();
    }
    const accountEmail = account[emailField].toLowerCase();
    const role = teacher ? (config.adminEmails.includes(accountEmail) ? 'admin' : 'teacher') : 'student';
    const token = jwt.sign({ role, email: accountEmail }, config.secretKey, {
      algorithm: 'HS256', subject: String(account._id), issuer: JWT_OPTIONS.issuer,
      audience: JWT_OPTIONS.audience, expiresIn: config.tokenLifetime,
    });
    res.json({ [teacher ? 'teacher' : 'student']: account.toJSON(), token, role });
  });
}

module.exports = { authentication, requireRoles, login };
