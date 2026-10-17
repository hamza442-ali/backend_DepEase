const { Router } = require('express');

const gitlabController = require('../controllers/gitlab.controller');

const router = Router();

router.post('/home', gitlabController.home);
router.get('/Check', gitlabController.check);

module.exports = router;
