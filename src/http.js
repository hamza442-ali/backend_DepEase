// Compatibility facade; import individual modules in new code.
module.exports = {
  ...require('./errors/http-error'),
  ...require('./utils/async-handler'),
  ...require('./middleware/error-handler'),
  ...require('./middleware/validate-input'),
};
