const { getAccountType } = require('./accounts/account-types');
const { ROLES } = require('../constants/roles');
const { verifyPassword, PREFIX } = require('../security/passwords');
const { createAccessToken } = require('../security/tokens');
const { HttpError } = require('../errors/http-error');

function validateCredentials(email, password) {
  if (
    typeof email !== 'string' ||
    !email.trim() ||
    email.length > 254 ||
    typeof password !== 'string' ||
    !password ||
    password.length > 1024
  ) {
    throw new HttpError(400, 'Email and password are required');
  }
}

async function upgradeLegacyPassword(account, field, password) {
  if (account[field].startsWith(PREFIX)) return;
  if (password.length < 8) {
    throw new HttpError(403, 'Ask an administrator to reset your password');
  }
  account.markModified(field);
  await account.save();
}

function accountRole(type, email, adminEmails) {
  if (type === ROLES.STUDENT) return ROLES.STUDENT;
  return adminEmails.includes(email) ? ROLES.ADMIN : ROLES.TEACHER;
}

async function createSession(type, { email, password }, config) {
  validateCredentials(email, password);
  const { model, emailField, passwordField } = getAccountType(type);
  const account = await model.findOne({ [emailField]: email.trim() }).select(`+${passwordField}`);
  if (!account || !(await verifyPassword(password, account[passwordField]))) {
    throw new HttpError(401, 'Invalid credentials');
  }

  await upgradeLegacyPassword(account, passwordField, password);
  const accountEmail = account[emailField].toLowerCase();
  const role = accountRole(type, accountEmail, config.adminEmails);
  const token = createAccessToken(account._id, role, accountEmail, config);
  return { [type]: account.toJSON(), token, role };
}

module.exports = { createSession };
