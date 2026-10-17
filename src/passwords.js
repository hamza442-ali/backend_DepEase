// Compatibility facade for credential utilities and model hooks.
module.exports = {
  ...require('./security/passwords'),
  ...require('./models/plugins/password.plugin'),
};
