const { requireRoles } = require('../middleware/authorize-roles');
const { ROLES, STAFF_ROLES } = require('../constants/roles');

const featureRoutes = [
  { paths: ['/requirements'], router: require('./requirement.routes') },
  { paths: ['/email'], router: require('./email.routes') },
  { paths: ['/teamMember'], router: require('./team-member.routes') },
  { paths: ['/deliverables'], router: require('./deliverable.routes') },
  { paths: ['/group'], router: require('./group.routes') },
  { paths: ['/modules'], router: require('./project-module.routes') },
  { paths: ['/project', '/projects'], router: require('./project.routes') },
  { paths: ['/proposals'], router: require('./proposal.routes') },
  { paths: ['/tasks'], router: require('./task.routes') },
  { paths: ['/resource'], router: require('./resource-request.routes') },
  { paths: ['/student'], router: require('./student.routes') },
  { paths: ['/student'], router: require('./student-admin.routes') },
  { paths: ['/teacher'], router: require('./teacher-admin.routes') },
  { paths: ['/teacher'], router: require('./teacher.routes') },
  { paths: ['/documents'], router: require('./document.routes') },
  { paths: ['/projectIdea'], router: require('./project-idea.routes') },
  { paths: ['/fypPanel'], router: require('./panel-membership.routes'), roles: STAFF_ROLES },
  { paths: ['/panel'], router: require('./panel.routes'), roles: [ROLES.ADMIN] },
  { paths: ['/announcementS'], router: require('./supervisor-announcement.routes') },
  { paths: ['/announcementA'], router: require('./admin-announcement.routes') },
  {
    paths: ['/announcement'],
    router: require('./admin-announcement-management.routes'),
    roles: [ROLES.ADMIN],
  },
  { paths: ['/evaluation'], router: require('./evaluation.routes'), roles: STAFF_ROLES },
  { paths: ['/addMarks'], router: require('./evaluation-marks.routes'), roles: STAFF_ROLES },
  { paths: ['/schedule', '/scheduling'], router: require('./schedule-slot.routes') },
  { paths: ['/scheduler'], router: require('./project-scheduler.routes'), roles: STAFF_ROLES },
  { paths: ['/assignmentPanel'], router: require('./panel-assignment.routes'), roles: STAFF_ROLES },
  { paths: ['/jenkins'], router: require('./pipeline.routes'), roles: STAFF_ROLES },
];

function registerRoutes(app, authenticate) {
  app.get('/workspace/capabilities', authenticate, (req, res) =>
    res.json({
      documents: { storage: process.env.DOCUMENT_STORAGE || 'local' },
      messages: {
        internal: true,
        emailConfigured: ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM'].every((key) =>
          Boolean(process.env[key]),
        ),
      },
      deployments: {
        configured: Boolean(
          process.env.JENKINS_BRIDGE_TOKEN && process.env.JENKINS_BRIDGE_TOKEN.length >= 32,
        ),
      },
    }),
  );
  for (const { paths, router, roles } of featureRoutes) {
    const middleware = roles ? [authenticate, requireRoles(...roles)] : [authenticate];
    for (const routePath of paths) app.use(routePath, ...middleware, router);
  }
}

module.exports = { registerRoutes };
