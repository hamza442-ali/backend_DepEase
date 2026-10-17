const { Router } = require('express');
const { createLoginHandler } = require('../controllers/authentication.controller');
const { rateLimit } = require('../middleware/rate-limit');
const { ROLES } = require('../constants/roles');

function createAuthenticationRouter(config) {
  const router = Router();
  const loginLimit = rateLimit();
  router.post('/login', loginLimit, createLoginHandler(config, ROLES.STUDENT));
  router.post('/loginT', loginLimit, createLoginHandler(config, ROLES.TEACHER));
  return router;
}

module.exports = { createAuthenticationRouter };
