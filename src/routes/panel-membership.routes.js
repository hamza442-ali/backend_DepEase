const { Router } = require('express');
const router = Router();

const panelController = require('../controllers/panel-membership.controller');

router.get('/getall/:teacherId', panelController.getAllPanelsByTeacherId);

module.exports = router;
