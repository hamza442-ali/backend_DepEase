const AdminAnnouncement = require('../models/admin-announcement.model');
const { createCrudHandlers } = require('./crud-handlers');
const handlers = createCrudHandlers(AdminAnnouncement, 'Announcement');
exports.getAllAnnouncements = handlers.list();
