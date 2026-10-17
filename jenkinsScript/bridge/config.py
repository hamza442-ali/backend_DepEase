"""Read bridge settings without exposing environment values in errors."""
import os
from dataclasses import dataclass
from urllib.parse import urlparse

from .errors import BridgeError

MAX_CONTENT_LENGTH = 1024 * 1024
REQUEST_TIMEOUT = (5, 10)
BUILD_WAIT_SECONDS = 90
POLL_INTERVAL_SECONDS = 2


@dataclass(frozen=True)
class JenkinsSettings:
    url: str
    username: str
    api_token: str


def load_jenkins_settings():
    url = os.environ.get('JENKINS_URL', '').rstrip('/')
    username = os.environ.get('JENKINS_USER')
    token = os.environ.get('JENKINS_API_TOKEN')
    if not url or not username or not token:
        raise BridgeError('Jenkins is not configured', 503)

    parsed = urlparse(url)
    if (parsed.scheme not in ('http', 'https') or not parsed.hostname
            or parsed.username or parsed.password):
        raise BridgeError('Jenkins URL is invalid', 503)
    return JenkinsSettings(url, username, token)


def bridge_token():
    token = os.environ.get('JENKINS_BRIDGE_TOKEN', '')
    if len(token) < 32:
        raise BridgeError('Bridge is not configured', 503)
    return token
