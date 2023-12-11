const express = require('express');
const router = express.Router();


const panelController = require('../controller/fypPanelController');


//get all panels
router.get('/getall/:teacherId', panelController.getAllPanelsByTeacherId);



module.exports = router;