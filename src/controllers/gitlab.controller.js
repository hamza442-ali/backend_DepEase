const axios = require('axios');
const { asyncHandler } = require('../utils/async-handler');
const { HttpError } = require('../errors/http-error');
exports.home = asyncHandler(async (req, res) => {
  if (!process.env.GITLAB_TOKEN) throw new HttpError(503, 'GitLab integration is not configured');
  const response = await axios.get('https://gitlab.com/api/v4/projects', {
    timeout: 10000,
    headers: { Authorization: 'Bearer ' + process.env.GITLAB_TOKEN },
    params: { membership: true, per_page: 50 },
  });
  res.json(response.data);
});
exports.check = (req, res) => res.json('it is working fine');
