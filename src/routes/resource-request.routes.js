const { staff } = require('../middleware/access');
const { Router } = require('express');
const router = Router();
const resourceRequestController = require('../controllers/resource-request.controller');

router.post('/add', resourceRequestController.createResourceRequest);

router.get('/getall', resourceRequestController.getResourceRequests);

router.get('/getmine/:projectId', resourceRequestController.getResourceRequestsbyProjectid);

router.get('/getbyteacherId/:TeacherId', resourceRequestController.getResourceRequestsbyTeacherid);

router.put('/update/:id', staff, resourceRequestController.updateResourceRequest);

router.delete('/delete/:id', resourceRequestController.deleteResourceRequest);

module.exports = router;
