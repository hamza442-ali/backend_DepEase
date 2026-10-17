const express = require('express');
const router = express.Router();

const APIContoller = require('../controllers/gitlab.controller');

router.post('/home', APIContoller.home);
router.get('/Check', APIContoller.check);

module.exports = router;
