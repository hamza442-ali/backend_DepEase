const { Router } = require('express');
const router = Router();

const gitlabController = require('../controllers/gitlab.controller');

router.post('/home', gitlabController.home);
router.get('/Check', gitlabController.check);

module.exports = router;
