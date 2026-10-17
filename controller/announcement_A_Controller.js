const Model = require('../model/announcement_A_Model');
const { crud } = require('../src/crud');
const handlers = crud(Model, 'Announcement');
exports.getAllAnnouncements = handlers.list();
