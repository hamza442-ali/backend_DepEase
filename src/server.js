const mongoose = require('mongoose');
const { configureStorage } = require('./integrations/cloudinary/storage');
const { loadConfig } = require('./config/environment');
const { connectDatabase, disconnectDatabase } = require('./database/connection');
const { listen, registerShutdown } = require('./lifecycle/http-server');
const { createApp } = require('./app');

async function startServer(env = process.env) {
  const config = loadConfig(env);
  mongoose.set('runValidators', true);
  configureStorage(env);
  const app = createApp(config);
  await connectDatabase(config.mongoUri);

  let server;
  try {
    // Request idempotency and group enrollment rely on these database constraints.
    await Promise.all(
      ['Group', 'Project', 'Proposal', 'Panel', 'Pipeline', 'PipelineBuild'].map((name) =>
        mongoose.model(name).init(),
      ),
    );
    server = await listen(app, config.port);
  } catch (error) {
    await disconnectDatabase();
    throw error;
  }

  console.log(`DepEase API listening on port ${config.port}`);
  const shutdown = registerShutdown(server, disconnectDatabase);
  return { app, server, shutdown };
}

module.exports = { startServer };
