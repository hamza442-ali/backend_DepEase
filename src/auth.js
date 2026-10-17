// Compatibility facade for the original authentication module.
const { authentication } = require('./middleware/authenticate');
const { requireRoles } = require('./middleware/authorize-roles');
const { createLoginHandler } = require('./controllers/authentication.controller');
const { ROLES } = require('./constants/roles');

function login(config, teacher = false) {
  return createLoginHandler(config, teacher ? ROLES.TEACHER : ROLES.STUDENT);
}

module.exports = { authentication, requireRoles, login };
