const { Router } = require('express');
const router = Router();
const addMarksController = require('../controllers/evaluation-marks.controller');

router.post('/add', addMarksController.createAddMarks);
router.get('/getall', addMarksController.getAllAddMarks);
router.get('/getmine/:ProjectId', addMarksController.getAddMarksByProjectId);
router.put('/update/:ProjectId', addMarksController.updateAddMarks);
router.delete('/delete/:id', addMarksController.deleteAddMarks);

module.exports = router;
