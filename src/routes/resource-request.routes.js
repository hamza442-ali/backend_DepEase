const { staff } = require('../middleware/access');
const { Router } = require('express');
const resourceRequestController = require('../controllers/resource-request.controller');

const router = Router();

router.post('/add', resourceRequestController.createResourceRequest);

router.get('/getall', resourceRequestController.getResourceRequests);

router.get('/getmine/:projectId', resourceRequestController.listProjectResourceRequests);

router.get('/getbyteacherId/:TeacherId', resourceRequestController.listTeacherResourceRequests);

router.put('/update/:id', staff, resourceRequestController.updateResourceRequest);

router.delete('/delete/:id', resourceRequestController.deleteResourceRequest);

module.exports = router;
