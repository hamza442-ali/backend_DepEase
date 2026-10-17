require('dotenv').config();
const { runAccountCommand } = require('../src/cli/account-command');
const { resetPassword } = require('../src/services/accounts/operator.service');

runAccountCommand({
  operation: resetPassword,
  successMessage: 'Password reset',
  failureMessage: 'Password reset failed. Check input, account email, and configuration.',
});
