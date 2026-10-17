const axios = require('axios');
const { jenkinsSettings } = require('../../config/integrations');

function jenkinsClient() {
  return axios.create(jenkinsSettings());
}

module.exports = { jenkinsClient };
