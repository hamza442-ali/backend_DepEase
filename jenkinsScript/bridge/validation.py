"""Validate bridge inputs before they reach Jenkins."""
import re
from urllib.parse import urlparse

from .errors import BridgeError

JOB_PATTERN = re.compile(r'^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$')
REPOSITORY_HOSTS = frozenset(('github.com', 'gitlab.com', 'bitbucket.org'))


def job_payload(data):
    if not isinstance(data, dict):
        raise BridgeError('A JSON object is required')
    name = data.get('job_name')
    if not isinstance(name, str) or not JOB_PATTERN.fullmatch(name):
        raise BridgeError('Invalid job name')
    return data, name


def validate_repository(repository):
    if not isinstance(repository, str):
        raise BridgeError('Repository URL is required')
    repo = urlparse(repository)
    try:
        port = repo.port
    except ValueError as error:
        raise BridgeError('Repository URL is invalid') from error

    if (repo.scheme != 'https' or repo.hostname not in REPOSITORY_HOSTS
            or repo.username or repo.password or repo.query or repo.fragment or port
            or len([part for part in repo.path.split('/') if part]) < 2):
        raise BridgeError('Use an HTTPS GitHub, GitLab or Bitbucket repository URL')
    return repository
