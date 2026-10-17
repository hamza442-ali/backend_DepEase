const { Router } = require('express');

const panelController = require('../controllers/panel-membership.controller');

const router = Router();

router.get('/getall/:teacherId', panelController.getAllPanelsByTeacherId);

module.exports = router;
