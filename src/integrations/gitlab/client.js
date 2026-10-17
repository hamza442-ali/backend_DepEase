const axios = require('axios');
const { HttpError } = require('../../errors/http-error');

async function listMemberProjects() {
  const token = process.env.GITLAB_TOKEN;
  if (!token) throw new HttpError(503, 'GitLab integration is not configured');
  const response = await axios.get('https://gitlab.com/api/v4/projects', {
    timeout: 10000,
    headers: { Authorization: `Bearer ${token}` },
    params: { membership: true, per_page: 50 },
  });
  return response.data;
}

module.exports = { listMemberProjects };
