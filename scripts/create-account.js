require('dotenv').config();
const { runAccountCommand } = require('../src/cli/account-command');
const { createAccount } = require('../src/services/accounts/operator.service');

runAccountCommand({
  operation: createAccount,
  successMessage: 'Account created',
  failureMessage:
    'Account creation failed. Check input, configuration, and duplicate email or registration number.',
});
