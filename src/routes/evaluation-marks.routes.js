const { Router } = require('express');
const addMarksController = require('../controllers/evaluation-marks.controller');

const router = Router();

router.post('/add', addMarksController.createMarks);
router.get('/getall', addMarksController.listMarks);
router.get('/getmine/:ProjectId', addMarksController.listProjectMarks);
router.put('/record/:id', addMarksController.updateMarks);
router.put('/update/:ProjectId', addMarksController.updateProjectMarks);
router.delete('/delete/:id', addMarksController.deleteMarks);

module.exports = router;
