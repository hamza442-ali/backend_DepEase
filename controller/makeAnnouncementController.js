const Model = require('../model/announcement_A_Model');
const { crud } = require('../src/crud');
const handlers = crud(Model, 'Announcement');

exports.makeAnnouncement = handlers.create(req => ({ title: req.body.title, richText: req.body.richText }));
exports.getAnnouncement = handlers.list();
exports.deleteAnnouncement = handlers.remove();
