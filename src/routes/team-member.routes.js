const { Router } = require('express');
const router = Router();
const teamMemberController = require('../controllers/team-member.controller');

router.post('/addMember', teamMemberController.addTeamMember);

router.delete('/deleteMember/:projectid/:student_id', teamMemberController.deleteTeamMember);

router.get('/getMembers/:projectid', teamMemberController.getAllTeamMembers);

router.get('/findMember/:id', teamMemberController.getTeamMemberById);

router.patch('/assignRole/:id', teamMemberController.assignRoleToTeamMember);

router.patch('/assignReq/:id', teamMemberController.assignRequirementsToTeamMember);

module.exports = router;
