require('dotenv').config();
const { startServer } = require('./src/server');
if (require.main === module) {
  startServer().catch(() => {
    console.error('Backend startup failed. Check configuration and database connectivity.');
    process.exitCode = 1;
  });
}
module.exports = require('./src/app');
