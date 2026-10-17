const { Router } = require('express');
const router = Router();

const schedulingController = require('../controllers/schedule-slot.controller');
const { staff } = require('../middleware/access');

router.get('/getAll', schedulingController.getAll);

router.post('/create', staff, schedulingController.createSchedule);

router.put('/update/:id', staff, schedulingController.updateSchedule);

router.delete('/delete', staff, schedulingController.deleteSchedule);

module.exports = router;
