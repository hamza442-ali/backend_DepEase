import json
import os
import unittest
from unittest.mock import MagicMock, patch

from jenkinsScript.bridge.app import create_app
from jenkinsScript.bridge import runs
from jenkinsScript.bridge.job_config import pipeline_xml


def response(data=None, status=200, headers=None, content=None):
    result = MagicMock()
    result.status_code = status
    result.headers = headers or {}
    result.json.return_value = data
    result.iter_content.return_value = [content if content is not None else json.dumps(data).encode()]
    return result


class RunTests(unittest.TestCase):
    def setUp(self):
        self.env = patch.dict(os.environ, {'JENKINS_BRIDGE_TOKEN': 't' * 32,
            'JENKINS_URL': 'http://jenkins:8080', 'JENKINS_USER': 'service', 'JENKINS_API_TOKEN': 'test'})
        self.env.start()
        self.addCleanup(self.env.stop)
        self.client = create_app().test_client()
        self.headers = {'X-Bridge-Token': 't' * 32}
        self.body = {'job_name': 'project', 'request_id': 'a' * 24, 'queue_id': 17}

    def post(self, path, data=None):
        return self.client.post(path, json=data or self.body, headers=self.headers)

    def test_start_returns_queue_without_waiting_or_reading_console(self):
        with patch.object(runs, 'call', return_value=response(headers={'Location': 'http://jenkins/queue/item/17/'})) as call:
            result = self.post('/start_build')
            self.assertEqual(result.status_code, 202)
            self.assertEqual(result.json['queueId'], 17)
            self.assertEqual(call.call_count, 1)
            self.assertEqual(call.call_args.kwargs['data']['DEPEASE_REQUEST_ID'], 'a' * 24)

    def test_running_build_is_bound_to_the_original_queue(self):
        queued = response({'task': {'name': 'project'}, 'executable': {'number': 3}})
        build = response({'queueId': 17, 'building': True, 'result': None})
        with patch.object(runs, 'call', side_effect=[queued, build]):
            result = self.post('/build_status')
            self.assertEqual(result.json['status'], 'RUNNING')
            self.assertEqual(result.json['buildNumber'], 3)

    def test_evicted_queue_is_recovered_from_history_and_prefers_the_small_url_artifact(self):
        results = [response(status=404), response({'items': []}),
            response({'builds': [{'number': 3, 'queueId': 17}]}),
            response({'queueId': 17, 'building': False, 'result': 'SUCCESS'}),
            response(content=b'{"url":"https://application.example.test"}')]
        with patch.object(runs, 'call', side_effect=results) as call:
            result = self.post('/build_status')
            self.assertEqual(result.json['status'], 'SUCCESS')
            self.assertEqual(result.json['deploymentLink'], 'https://application.example.test')
            self.assertNotIn('console_output', result.json)
            self.assertFalse(any('consoleText' in item.args[2] for item in call.call_args_list))

    def test_queue_identity_change_is_not_reported_as_another_jobs_build(self):
        with patch.object(runs, 'call', return_value=response({'task': {'name': 'another-project'}})) as call:
            result = self.post('/build_status')
            self.assertEqual(result.json['status'], 'UNKNOWN')
            self.assertEqual(call.call_count, 1)

    def test_missing_queue_and_history_remain_unknown_instead_of_starting_again(self):
        with patch.object(runs, 'call', side_effect=[response(status=404), response({'items': []}), response({'builds': []})]) as call:
            result = self.post('/build_status')
            self.assertEqual(result.json['status'], 'UNKNOWN')
            self.assertTrue(all(item.args[1] == 'GET' for item in call.call_args_list))

    def test_cancellation_waits_for_the_controllers_terminal_confirmation(self):
        waiting = {'task': {'name': 'project'}}
        cancelled = {**waiting, 'cancelled': True}
        with patch.object(runs, 'call', side_effect=[response(waiting), response(status=302), response(cancelled)]) as call:
            result = self.post('/cancel_build')
            self.assertEqual(result.json['status'], 'ABORTED')
            self.assertFalse(result.json['cancelRequested'])
            self.assertIn('/queue/cancelItem', call.call_args_list[1].args[2])

    def test_bad_identifiers_and_non_http_publication_links_are_rejected(self):
        for request_id in ['../private', 'a' * 23, None]:
            self.assertEqual(self.post('/start_build', {**self.body, 'request_id': request_id}).status_code, 400)
        for value in ['javascript:alert(1)', 'https://user:secret@example.test', 'https://example.test\nsecret']:
            self.assertEqual(runs.deployment_url(value), '')
        with patch.object(runs, 'call') as call:
            self.assertEqual(self.post('/build_status', {**self.body, 'queue_id': True}).status_code, 400)
            call.assert_not_called()

    def test_generated_config_has_repository_branch_path_and_request_correlation(self):
        xml = pipeline_xml('https://github.com/example/repository', 'feature/ui', '.ci/Jenkinsfile', 'a' * 24)
        self.assertIn('*/feature/ui', xml)
        self.assertIn('<scriptPath>.ci/Jenkinsfile</scriptPath>', xml)
        self.assertIn('DEPEASE_REQUEST_ID', xml)
        self.assertIn('Managed by DepEase: ' + 'a' * 24, xml)


if __name__ == '__main__':
    unittest.main()
