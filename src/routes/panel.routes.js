const { Router } = require('express');

const panelController = require('../controllers/panel.controller');

const router = Router();

router.post('/createPanel', panelController.createPanel);

router.get('/getAllPanels', panelController.getAllPanels);

router.delete('/deletePanelbyID/:id', panelController.deletePanel);

router.post('/assignPanel', panelController.assignPanel);

router.put('/editPanelId/:id', panelController.renamePanel);

module.exports = router;
