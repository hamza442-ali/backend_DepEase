const express = require('express');
const cors = require('cors');
const { authentication } = require('./middleware/authenticate');
const { createAuthenticationRouter } = require('./routes/authentication.routes');
const healthRoutes = require('./routes/health.routes');
const { registerRoutes } = require('./routes/index');
const { HttpError } = require('./errors/http-error');
const { errorHandler } = require('./middleware/error-handler');
const { validateInput } = require('./middleware/validate-input');
const { securityHeaders } = require('./middleware/security-headers');

function createApp(config) {
  const app = express();
  app.disable('x-powered-by');
  app.use(securityHeaders);
  app.use(cors({ origin: config.corsOrigins }));
  app.use(express.json({ limit: config.bodyLimit }));
  app.use(express.urlencoded({ extended: false, limit: config.bodyLimit }));
  app.use(validateInput);
  app.locals.uploadLimit = config.uploadLimit;
  app.use(healthRoutes);
  app.use(createAuthenticationRouter(config));
  registerRoutes(app, authentication(config));
  app.use((req, res, next) => next(new HttpError(404, 'Route not found')));
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
