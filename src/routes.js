const { requireRoles } = require('./auth');

function registerRoutes(app, authenticate) {
  const admin = requireRoles('admin');
  const staff = requireRoles('teacher', 'admin');
  const routes = [
    ['/requirements', '../routes/requirementsRoute'],
    ['/email', '../routes/emailRoutes'],
    ['/teamMember', '../routes/teamMemberRoutes'],
    ['/deliverables', '../routes/delieverablesRoutes'],
    ['/group', '../routes/groupRoutes'],
    ['/modules', '../routes/moduleRoutes'],
    ['/projects', '../routes/projectRoutes'],
    ['/project', '../routes/projectRoute'],
    ['/proposals', '../routes/proposalRoutes'],
    ['/tasks', '../routes/taskRoutes'],
    ['/resource', '../routes/resourceRequestRoutes'],
    ['/student', '../routes/studentRoutes'],
    ['/student', '../routes/studentRoute'],
    ['/teacher', '../routes/teacherRoute'],
    ['/teacher', '../routes/teacherRoutes'],
    ['/documents', '../routes/documentRoutes'],
    ['/projectIdea', '../routes/projectIdeasRoutes'],
    ['/fypPanel', '../routes/fypPanelRoutes', staff],
    ['/panel', '../routes/createPanelRoute', admin],
    ['/announcementS', '../routes/announcement_S_Routes'],
    ['/announcementA', '../routes/announcement_A_Routes'],
    ['/announcement', '../routes/makeAnnouncementRoute', admin],
    ['/evaluation', '../routes/evaluationRoute', staff],
    ['/addMarks', '../routes/addMarksRoutes', staff],
    ['/schedule', '../routes/schedulingRoutes'],
    ['/scheduling', '../routes/schedulingRoutes'],
    ['/scheduler', '../routes/schedulerRoutes', staff],
    ['/assignmentPanel', '../routes/assignmentPanelRoutes', staff],
    ['/jenkins', '../routes/jenkinsRoutes', staff],
  ];
  for (const [path, modulePath, role] of routes) {
    const router = require(modulePath);
    app.use(path, authenticate, ...(role ? [role] : []), router);
  }
}

module.exports = { registerRoutes };
