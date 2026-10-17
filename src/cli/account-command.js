const fs = require('node:fs');
const { loadConfig } = require('../config/environment');
const { getAccountType } = require('../services/accounts/account-types');
const { withDatabase } = require('../database/connection');

async function runAccountCommand({ operation, successMessage, failureMessage }) {
  try {
    const type = process.argv[2];
    getAccountType(type);
    const config = loadConfig();
    const input = JSON.parse(fs.readFileSync(0, 'utf8'));
    await withDatabase(config.mongoUri, () => operation(type, input));
    console.log(successMessage);
  } catch {
    // Operator input and database exceptions may contain credentials.
    console.error(failureMessage);
    process.exitCode = 1;
  }
}

module.exports = { runAccountCommand };
