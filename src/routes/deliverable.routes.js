const { Router } = require('express');
const router = Router();
const deliverableController = require('../controllers/deliverable.controller');

router.post('/add', deliverableController.createDeliverable);

router.get('/getall', deliverableController.getDeliverables);

router.get('/getmine/:projectId', deliverableController.getDeliverableById);

router.put('/update/:id', deliverableController.updateDeliverable);

router.delete('/delete/:id', deliverableController.deleteDeliverable);

router.post('/addModuleToDeliverable', deliverableController.addModuleToDeliverable);

router.delete(
  '/removeModuleFromDeliverable/:moduleId/:deliverableId',
  deliverableController.removeModuleFromDeliverable,
);

module.exports = router;
