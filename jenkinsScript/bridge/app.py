"""Flask HTTP boundary for the private Jenkins bridge."""
import requests
from flask import Flask, jsonify, request
from werkzeug.exceptions import HTTPException

from . import services
from . import runs
from .auth import authenticate_bridge
from .config import MAX_CONTENT_LENGTH
from .errors import BridgeError


def create_app():
    app = Flask(__name__)
    app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH
    app.before_request(authenticate_bridge)

    @app.get('/connection')
    def connection():
        return jsonify(runs.connection())

    @app.post('/start_build')
    def start_build():
        return jsonify(runs.start(request.get_json(silent=True))), 202

    @app.post('/build_status')
    def build_status():
        return jsonify(runs.status(request.get_json(silent=True)))

    @app.post('/cancel_build')
    def cancel_build():
        return jsonify(runs.cancel(request.get_json(silent=True)))

    @app.errorhandler(BridgeError)
    def bridge_error(error):
        return jsonify(error=str(error)), error.status

    @app.errorhandler(requests.RequestException)
    def upstream_error(error):
        return jsonify(error='Jenkins request failed'), 502

    @app.errorhandler(HTTPException)
    def http_error(error):
        return jsonify(error=error.name), error.code

    @app.post('/login')
    def login():
        return jsonify(services.login())

    @app.post('/create_job')
    def create_job():
        return jsonify(services.create_job(request.get_json(silent=True)))

    @app.post('/build_pipeline')
    def build_pipeline():
        result, status = services.build_pipeline(request.get_json(silent=True))
        return jsonify(result), status

    @app.delete('/delete_pipeline')
    def delete_pipeline():
        return jsonify(services.delete_pipeline(request.get_json(silent=True)))

    return app
