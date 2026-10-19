"""Short, resumable Jenkins requests; no worker waits for a build to finish."""
import json
import re
from urllib.parse import urlparse

from .client import call, create_client
from .errors import BridgeError
from .validation import job_payload

QUEUE_LOCATION = re.compile(r'/queue/item/(\d+)/?$')
REQUEST_ID = re.compile(r'^[a-f0-9]{24}$')
TERMINAL = frozenset(('SUCCESS', 'FAILURE', 'ABORTED', 'UNSTABLE', 'NOT_BUILT'))


def number(value, field):
    if value is not None and (isinstance(value, bool) or not isinstance(value, int) or value < 1):
        raise BridgeError(f'{field} must be a positive integer')
    return value


def payload(data):
    data, name = job_payload(data)
    request_id = data.get('request_id')
    if not isinstance(request_id, str) or not REQUEST_ID.fullmatch(request_id):
        raise BridgeError('A build request identifier is required')
    return data, name, request_id


def parameters(item):
    return {p.get('name'): p.get('value') for action in item.get('actions', [])
            for p in action.get('parameters', [])}


def deployment_url(value):
    if not isinstance(value, str) or len(value) > 2048 or any(ord(c) < 32 for c in value):
        return ''
    try:
        parsed = urlparse(value.strip())
        if parsed.scheme in ('http', 'https') and parsed.hostname and not parsed.username and not parsed.password:
            return value.strip()
    except ValueError:
        pass
    return ''


def deployment(session, url, name, build_number):
    artifact = call(session, 'GET', f'{url}/job/{name}/{build_number}/artifact/depease-deployment.json',
                    accepted_statuses=(200, 404), stream=True)
    try:
        if artifact.status_code == 200:
            content = bytearray()
            for chunk in artifact.iter_content(4096):
                content.extend(chunk)
                if len(content) > 16384:
                    return ''
            try:
                return deployment_url(json.loads(content).get('url'))
            except (ValueError, AttributeError):
                return ''
    finally:
        artifact.close()
    # Compatibility for existing Jenkinsfiles. Keep a bounded tail and never expose logs.
    console = call(session, 'GET', f'{url}/job/{name}/{build_number}/consoleText', stream=True)
    tail = bytearray()
    try:
        for chunk in console.iter_content(16384):
            tail.extend(chunk)
            del tail[:-65536]
    finally:
        console.close()
    return next((deployment_url(line.partition(':')[2]) for line in reversed(tail.decode('utf-8', 'replace').splitlines())
                 if line.startswith('deployedLink:')), '')


def start(data):
    _, name, request_id = payload(data)
    url, session = create_client()
    with session:
        response = call(session, 'POST', f'{url}/job/{name}/buildWithParameters',
                        data={'PARAM_NAME': 'true', 'DEPEASE_REQUEST_ID': request_id})
        match = QUEUE_LOCATION.search(response.headers.get('Location', ''))
        if not match:
            raise BridgeError('Jenkins accepted the request without a queue identifier', 502)
    return {'status': 'QUEUED', 'queueId': int(match.group(1)), 'message': 'Build queued'}


def status_with_client(session, url, data, name, request_id):
    queue_id = number(data.get('queue_id'), 'queue_id')
    build_number = number(data.get('build_number'), 'build_number')
    if not build_number and queue_id:
        response = call(session, 'GET', f'{url}/queue/item/{queue_id}/api/json', accepted_statuses=(200, 404))
        if response.status_code == 200:
            queued = response.json()
            if queued.get('task', {}).get('name') != name:
                return {'status': 'UNKNOWN', 'message': 'The queue item no longer belongs to this pipeline'}
            if queued.get('cancelled'):
                return {'status': 'ABORTED', 'queueId': queue_id}
            build_number = queued.get('executable', {}).get('number')
            if not build_number:
                return {'status': 'QUEUED', 'queueId': queue_id, 'message': 'Waiting for a Jenkins executor'}
    if not build_number:
        queued = call(session, 'GET', url + '/queue/api/json', params={
            'tree': 'items[id,task[name],actions[parameters[name,value]]]',
        }).json()
        for item in queued.get('items', []):
            if item.get('task', {}).get('name') == name and parameters(item).get('DEPEASE_REQUEST_ID') == request_id:
                return {'status': 'QUEUED', 'queueId': item['id'], 'message': 'Waiting for a Jenkins executor'}
        job = call(session, 'GET', f'{url}/job/{name}/api/json', params={
            'tree': 'builds[number,queueId,actions[parameters[name,value]]]{0,30}',
        }).json()
        match = next((build for build in job.get('builds', []) if
                      (queue_id and build.get('queueId') == queue_id) or
                      parameters(build).get('DEPEASE_REQUEST_ID') == request_id), None)
        if not match:
            return {'status': 'UNKNOWN', 'message': 'Jenkins has not confirmed this request. Refresh before starting another build.'}
        build_number = match['number']
    number(build_number, 'build_number')
    response = call(session, 'GET', f'{url}/job/{name}/{build_number}/api/json', accepted_statuses=(200, 404))
    if response.status_code == 404:
        return {'status': 'UNKNOWN', 'message': 'This build is no longer available in Jenkins'}
    build = response.json()
    correlation = parameters(build).get('DEPEASE_REQUEST_ID')
    if (correlation and correlation != request_id) or (queue_id and build.get('queueId') != queue_id):
        return {'status': 'UNKNOWN', 'message': 'Jenkins build identity changed. Check the controller before retrying.'}
    result = build.get('result')
    state = 'RUNNING' if build.get('building') or not result else result if result in TERMINAL else 'UNKNOWN'
    output = {'status': state, 'queueId': queue_id or build.get('queueId'), 'buildNumber': build_number,
              'durationMs': build.get('duration', 0), 'startedAt': build.get('timestamp')}
    if state == 'SUCCESS':
        output['deploymentLink'] = deployment(session, url, name, build_number)
    return output


def status(data):
    data, name, request_id = payload(data)
    url, session = create_client()
    with session:
        return status_with_client(session, url, data, name, request_id)


def cancel(data):
    data, name, request_id = payload(data)
    url, session = create_client()
    with session:
        current = status_with_client(session, url, data, name, request_id)
        if current['status'] == 'QUEUED':
            call(session, 'POST', url + '/queue/cancelItem', params={'id': current['queueId']},
                 accepted_statuses=(200, 201, 204, 302, 303, 404))
        elif current['status'] == 'RUNNING':
            call(session, 'POST', f"{url}/job/{name}/{current['buildNumber']}/stop",
                 accepted_statuses=(200, 201, 204, 302, 303, 404))
        requested = current['status'] in ('QUEUED', 'RUNNING')
        latest = status_with_client(session, url, data, name, request_id) if requested else current
        return {**latest, 'cancelRequested': requested and latest['status'] not in TERMINAL}


def connection():
    url, session = create_client()
    with session:
        response = call(session, 'GET', url + '/api/json')
        computers = call(session, 'GET', url + '/computer/api/json', params={
            'tree': 'computer[offline,numExecutors]',
        }).json()
    executors = sum(item.get('numExecutors', 0) for item in computers.get('computer', []) if not item.get('offline'))
    return {'connected': True, 'availableExecutors': executors,
            'message': 'Jenkins is connected' if executors else 'Jenkins is connected; waiting for a build agent'}
