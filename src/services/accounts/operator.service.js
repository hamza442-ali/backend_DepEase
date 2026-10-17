const { getAccountType } = require('./account-types');
const { ROLES } = require('../../constants/roles');
const { requireRecord } = require('../../utils/records');

function createAccount(type, input) {
  const { model } = getAccountType(type);
  const account = { ...input };
  if (type === ROLES.TEACHER) {
    account.passoword = account.password;
    delete account.password;
  }
  return model.create(account);
}

async function resetPassword(type, { email, password }) {
  if (typeof email !== 'string' || typeof password !== 'string') throw new Error('Invalid input');
  const { model, emailField, passwordField } = getAccountType(type);
  const account = requireRecord(await model.findOne({ [emailField]: email }), 'Account');
  account[passwordField] = password;
  return account.save();
}

module.exports = { createAccount, resetPassword };
