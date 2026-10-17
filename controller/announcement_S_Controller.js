const Model = require('../model/announcement_S_Model');
const { crud } = require('../src/crud');
const handlers = crud(Model, 'Announcement');

exports.addAnnouncement = handlers.create();
exports.getAnnouncementsByProjectId = handlers.list(req => ({ ProjectId: req.params.ProjectId }));
