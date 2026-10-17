"""Authenticate requests from the Node API."""
import hmac

from flask import request

from .config import bridge_token
from .errors import BridgeError


def authenticate_bridge():
    expected = bridge_token()
    supplied = request.headers.get('X-Bridge-Token', '')
    if not hmac.compare_digest(expected.encode(), supplied.encode()):
        raise BridgeError('Unauthorized', 401)
