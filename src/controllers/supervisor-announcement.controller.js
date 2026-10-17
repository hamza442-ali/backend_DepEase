const SupervisorAnnouncement = require('../models/supervisor-announcement.model');
const { createCrudHandlers } = require('./crud-handlers');
const handlers = createCrudHandlers(SupervisorAnnouncement, 'Announcement');

exports.addAnnouncement = handlers.create();
exports.getAnnouncementsByProjectId = handlers.list((req) => ({ ProjectId: req.params.ProjectId }));
