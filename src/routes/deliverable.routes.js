const { Router } = require('express');
const deliverableController = require('../controllers/deliverable.controller');

const router = Router();

router.post('/add', deliverableController.createDeliverable);

router.get('/getall', deliverableController.getDeliverables);

router.get('/getmine/:projectId', deliverableController.listProjectDeliverables);

router.put('/update/:id', deliverableController.updateDeliverable);

router.delete('/delete/:id', deliverableController.deleteDeliverable);

router.post('/addModuleToDeliverable', deliverableController.addModuleToDeliverable);

router.delete(
  '/removeModuleFromDeliverable/:moduleId/:deliverableId',
  deliverableController.removeModuleFromDeliverable,
);

module.exports = router;
