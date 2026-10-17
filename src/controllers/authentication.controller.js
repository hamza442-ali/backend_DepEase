const { createSession } = require('../services/authentication.service');
const { ROLES } = require('../constants/roles');
const { asyncHandler } = require('../utils/async-handler');

function createLoginHandler(config, type) {
  return asyncHandler(async (req, res) => {
    const credentials =
      type === ROLES.TEACHER
        ? { email: req.body.email, password: req.body.password ?? req.body.passoword }
        : { email: req.body.email_address, password: req.body.password };
    res.json(await createSession(type, credentials, config));
  });
}

module.exports = { createLoginHandler };
