"""HTTP transport for the configured Jenkins controller."""
import requests

from .config import REQUEST_TIMEOUT, load_jenkins_settings
from .errors import BridgeError

REDIRECT_STATUSES = frozenset((301, 302, 303, 307, 308))


def create_client():
    settings = load_jenkins_settings()
    session = requests.Session()
    session.auth = (settings.username, settings.api_token)
    return settings.url, session


def call(session, method, url, accepted_statuses=None, **kwargs):
    response = session.request(
        method, url, timeout=REQUEST_TIMEOUT, allow_redirects=False, **kwargs,
    )
    if accepted_statuses is not None:
        if response.status_code not in accepted_statuses:
            raise BridgeError('Jenkins deletion failed', 502)
    elif response.status_code >= 400 or response.status_code in REDIRECT_STATUSES:
        raise BridgeError('Jenkins request failed', 502)
    return response
