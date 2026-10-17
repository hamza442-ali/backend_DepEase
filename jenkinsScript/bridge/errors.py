"""Errors safe to return through the bridge API."""


class BridgeError(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.status = status
