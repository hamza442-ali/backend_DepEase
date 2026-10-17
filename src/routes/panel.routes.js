const { Router } = require('express');
const router = Router();

const panelController = require('../controllers/panel.controller');

router.post('/createPanel', panelController.createPanel);

router.get('/getAllPanels', panelController.getAllPanels);

router.delete('/deletePanelbyID/:id', panelController.deletePanelByID);

router.post('/assignPanel', panelController.AssignPanel);

router.put('/editPanelId/:id', panelController.editPanelIdByid);

module.exports = router;
