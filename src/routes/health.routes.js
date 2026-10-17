const { Router } = require('express');
const health = require('../controllers/health.controller');

const router = Router();

router.get('/', health.welcome);
router.get('/health/live', health.liveness);
router.get('/health/ready', health.readiness);

module.exports = router;
