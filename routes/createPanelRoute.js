

const express = require('express');
const router = express.Router();


const panelController = require('../controllers/createPanelController');


// Create a new panel
router.post('/createPanel', panelController.createPanel);
//get all panels
router.get ('/getAllPanels', panelController.getAllPanels); 
// delete panel using id
router.delete ('/deletePanelbyID/:id', panelController.deletePanelByID);
// Assign panel
router.post('/assignPanel', panelController.AssignPanel);
// editPanelIdByid
router.put('/editPanelId/:id', panelController.editPanelIdByid);




module.exports = router;