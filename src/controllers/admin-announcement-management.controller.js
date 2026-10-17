const AdminAnnouncement = require('../models/admin-announcement.model');
const { createCrudHandlers } = require('./crud-handlers');
const handlers = createCrudHandlers(AdminAnnouncement, 'Announcement');

exports.makeAnnouncement = handlers.create((req) => ({
  title: req.body.title,
  richText: req.body.richText,
}));
exports.getAnnouncement = handlers.list();
exports.deleteAnnouncement = handlers.remove();
