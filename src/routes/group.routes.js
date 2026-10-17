const { Router } = require('express');
const router = Router();
const groupController = require('../controllers/group.controller');

router.post('/add', groupController.createGroup);

router.get('/getall', groupController.getGroups);

router.get('/getone/:id', groupController.getGroupByMatching);

router.get('/getmine/:id', groupController.getGroupById);

router.put('/update/:id', groupController.updateGroup);

router.delete('/delete/:id', groupController.deleteGroup);

module.exports = router;
