const axios = require('axios');
const { HttpError } = require('../../errors/http-error');

function jenkinsClient() {
  const token = process.env.JENKINS_BRIDGE_TOKEN;
  if (!token || token.length < 32)
    throw new HttpError(503, 'Jenkins integration is not configured');
  return axios.create({
    baseURL: process.env.JENKINS_BRIDGE_URL || 'http://127.0.0.1:5000',
    timeout: 130000,
    headers: { 'X-Bridge-Token': token },
  });
}

module.exports = { jenkinsClient };
