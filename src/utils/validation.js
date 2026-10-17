const { HttpError } = require('../errors/http-error');

function arrayValue(value, field) {
  if (value === undefined || value === '') return [];
  let parsed = value;
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value);
    } catch {
      throw new HttpError(400, `${field} must be an array`);
    }
  }
  if (!Array.isArray(parsed)) throw new HttpError(400, `${field} must be an array`);
  return parsed;
}

function dateRange(start, end) {
  if (
    !start ||
    !end ||
    !Number.isFinite(Date.parse(start)) ||
    !Number.isFinite(Date.parse(end)) ||
    Date.parse(end) <= Date.parse(start)
  )
    throw new HttpError(400, 'End must be after start');
}

function jobName(value) {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(value)) {
    throw new HttpError(400, 'Job name must contain only letters, digits, underscores or hyphens');
  }
  return value;
}

function repositoryUrl(value) {
  let repository;
  try {
    repository = new URL(value);
  } catch {
    throw new HttpError(400, 'A valid HTTPS repository URL is required');
  }

  const allowedHosts = ['github.com', 'gitlab.com', 'bitbucket.org'];
  if (
    repository.protocol !== 'https:' ||
    !allowedHosts.includes(repository.hostname) ||
    repository.username ||
    repository.password ||
    repository.port ||
    repository.search ||
    repository.hash ||
    repository.pathname.split('/').filter(Boolean).length < 2
  ) {
    throw new HttpError(400, 'Use an HTTPS GitHub, GitLab or Bitbucket repository URL');
  }
  return repository.href;
}

module.exports = { arrayValue, dateRange, jobName, repositoryUrl };
