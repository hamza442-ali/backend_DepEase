import importlib.util
import os
from pathlib import Path
import unittest
from unittest.mock import patch, MagicMock

spec = importlib.util.spec_from_file_location('bridge', Path(__file__).parents[1] / 'jenkins.py')
bridge = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bridge)


class BridgeTests(unittest.TestCase):
    def setUp(self):
        self.environment = patch.dict(os.environ, {'JENKINS_BRIDGE_TOKEN': 't' * 32,
            'JENKINS_URL': 'http://localhost:8080', 'JENKINS_USER': 'test', 'JENKINS_API_TOKEN': 'test'})
        self.environment.start()
        self.addCleanup(self.environment.stop)
        self.client = bridge.app.test_client()
        self.headers = {'X-Bridge-Token': 't' * 32}

    def test_unauthenticated_bridge_calls_are_rejected(self):
        self.assertEqual(self.client.post('/login').status_code, 401)

    def test_bad_job_and_repository_input_is_rejected_before_contacting_jenkins(self):
        with patch.object(bridge.requests, 'Session') as session:
            for body in [{'job_name': '../outside'}, {'job_name': 'okay', 'git_repo_url': 'http://localhost/private'}]:
                self.assertEqual(self.client.post('/create_job', json=body, headers=self.headers).status_code, 400)
            session.assert_not_called()

    def test_missing_service_configuration_returns_503(self):
        with patch.dict(os.environ, {'JENKINS_API_TOKEN': ''}):
            self.assertEqual(self.client.post('/login', headers=self.headers).status_code, 503)

    def test_build_tracks_the_returned_queue_and_handles_missing_deployment_link(self):
        response = MagicMock()
        response.headers = {'Location': 'http://localhost:8080/queue/item/17/'}
        queued = MagicMock()
        queued.json.return_value = {'executable': {'number': 3}}
        build = MagicMock()
        build.json.return_value = {'building': False, 'result': 'SUCCESS'}
        console = MagicMock()
        console.text = 'successful build without a deployment line'
        with patch.object(bridge, 'call', side_effect=[response, queued, build, console]) as call:
            result = self.client.post('/build_pipeline', json={'job_name': 'project-1', 'param_value': True}, headers=self.headers)
            self.assertEqual(result.status_code, 200)
            self.assertEqual(result.json['deploymentLink'], '')
            self.assertEqual(result.json['buildNumber'], 3)
            self.assertIn('/queue/item/17/api/json', call.call_args_list[1].args[2])
            self.assertNotIn('console_output', result.json)


if __name__ == '__main__':
    unittest.main()
