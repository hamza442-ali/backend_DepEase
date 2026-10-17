const mongoose = require('mongoose');
const { configureStorage } = require('./integrations/cloudinary/storage');
const { loadConfig } = require('./config/environment');
const { createApp } = require('./app');

async function startServer(env = process.env) {
  const config = loadConfig(env);
  mongoose.set('runValidators', true);
  configureStorage(env);
  const app = createApp(config);
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  let server;
  try {
    server = await new Promise((resolve, reject) => {
      const listener = app.listen(config.port, () => resolve(listener));
      listener.once('error', reject);
    });
  } catch (error) {
    await mongoose.disconnect();
    throw error;
  }
  console.log(`DepEase API listening on port ${config.port}`);
  let stopping = false;
  const shutdown = () => {
    if (stopping) return;
    stopping = true;
    const deadline = setTimeout(() => process.exit(1), 10000);
    deadline.unref();
    server.close(async () => {
      try {
        await mongoose.disconnect();
      } catch {
        process.exitCode = 1;
      } finally {
        clearTimeout(deadline);
      }
    });
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
  return { app, server, shutdown };
}

module.exports = { startServer };
