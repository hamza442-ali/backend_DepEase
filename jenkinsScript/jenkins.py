"""Gunicorn and local development entry point for the private Jenkins bridge."""
from bridge.app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False)
