const { isDatabaseReady } = require('../database/connection');

function welcome(req, res) {
  res.send('welcome');
}

function liveness(req, res) {
  res.json({ status: 'ok' });
}

function readiness(req, res) {
  const ready = isDatabaseReady();
  res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'unavailable' });
}

module.exports = { welcome, liveness, readiness };
