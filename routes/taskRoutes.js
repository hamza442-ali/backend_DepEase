const express = require('express');
const router = express.Router();
const taskController = require('../controller/taskController');

router.get('/getall', taskController.getAllTasks);
router.post('/add', taskController.createTask);
router.put('/update/:id', taskController.updateTask);
router.delete('/delete/:id', taskController.deleteTask);
router.get('/getmine/:projectid', taskController.getbyProjectId);

module.exports = router;
