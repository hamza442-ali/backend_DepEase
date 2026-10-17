"""Coordinate Jenkins jobs independently of Flask request handling."""
import re
import time

from .client import call, create_client
from .config import BUILD_WAIT_SECONDS, POLL_INTERVAL_SECONDS
from .errors import BridgeError
from .job_config import pipeline_xml
from .validation import job_payload, validate_repository

QUEUE_LOCATION = re.compile(r'/queue/item/(\d+)/?$')


def login():
    url, session = create_client()
    with session:
        call(session, 'GET', url + '/api/json')
    return {'message': 'Login successful'}


def create_job(input_data):
    data, name = job_payload(input_data)
    repository = validate_repository(data.get('git_repo_url'))
    url, session = create_client()
    with session:
        call(
            session, 'POST', url + '/createItem', params={'name': name},
            data=pipeline_xml(repository).encode(),
            headers={'Content-Type': 'application/xml'},
        )
    return {'message': 'Pipeline job created successfully'}


def wait_for_build_number(session, url, queue_id, deadline):
    while time.monotonic() < deadline:
        queued = call(session, 'GET', f'{url}/queue/item/{queue_id}/api/json').json()
        if queued.get('cancelled'):
            raise BridgeError('Jenkins build was cancelled', 409)
        number = queued.get('executable', {}).get('number')
        if isinstance(number, int):
            return number
        time.sleep(POLL_INTERVAL_SECONDS)
    return None


def completed_build(session, url, name, number, build):
    if build['result'] != 'SUCCESS':
        return {
            'error': 'Jenkins build failed',
            'result': build['result'],
            'buildNumber': number,
        }, 502

    console = call(session, 'GET', f'{url}/job/{name}/{number}/consoleText').text
    deployment = next(
        (line.partition(':')[2].strip() for line in console.splitlines()
         if line.startswith('deployedLink:')),
        '',
    )
    # Console output can contain secrets; return only the extracted deployment link.
    return {
        'message': 'Build succeeded', 'deploymentLink': deployment,
        'buildNumber': number, 'result': 'SUCCESS',
    }, 200


def build_pipeline(input_data):
    data, name = job_payload(input_data)
    if not isinstance(data.get('param_value'), bool):
        raise BridgeError('param_value must be a boolean')

    url, session = create_client()
    deadline = time.monotonic() + BUILD_WAIT_SECONDS
    with session:
        response = call(
            session, 'POST', f'{url}/job/{name}/buildWithParameters',
            data={'PARAM_NAME': str(data['param_value']).lower()},
        )
        match = QUEUE_LOCATION.search(response.headers.get('Location', ''))
        if not match:
            raise BridgeError('Jenkins did not return a queue item', 502)
        queue_id = int(match.group(1))
        number = wait_for_build_number(session, url, queue_id, deadline)

        while isinstance(number, int) and time.monotonic() < deadline:
            build = call(session, 'GET', f'{url}/job/{name}/{number}/api/json').json()
            if not build.get('building') and build.get('result'):
                return completed_build(session, url, name, number, build)
            time.sleep(POLL_INTERVAL_SECONDS)

    return {
        'message': 'Build is queued or running', 'queueId': queue_id,
        'buildNumber': number, 'deploymentLink': '',
    }, 202


def delete_pipeline(input_data):
    _, name = job_payload(input_data)
    url, session = create_client()
    with session:
        call(
            session, 'POST', f'{url}/job/{name}/doDelete',
            accepted_statuses=(200, 201, 204, 302, 303),
        )
    return {'message': 'Job deleted successfully'}
