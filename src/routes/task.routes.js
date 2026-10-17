const { Router } = require('express');
const taskController = require('../controllers/task.controller');

const router = Router();

router.get('/getall', taskController.getAllTasks);
router.post('/add', taskController.createTask);
router.put('/update/:id', taskController.updateTask);
router.delete('/delete/:id', taskController.deleteTask);
router.get('/getmine/:projectid', taskController.listTasksByProjectId);

module.exports = router;
