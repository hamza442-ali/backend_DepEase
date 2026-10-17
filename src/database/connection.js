const mongoose = require('mongoose');

function connectDatabase(uri) {
  return mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
}

function disconnectDatabase() {
  return mongoose.disconnect();
}

function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

async function withDatabase(uri, operation) {
  await connectDatabase(uri);
  try {
    return await operation();
  } finally {
    await disconnectDatabase();
  }
}

module.exports = { connectDatabase, disconnectDatabase, isDatabaseReady, withDatabase };
