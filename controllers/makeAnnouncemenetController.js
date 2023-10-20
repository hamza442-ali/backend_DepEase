
const Announcement = require('../models/makeAnnouncementModel');



const makeAnnouncement = async (req, res) => {
    try {
        const { title, message } = req.body;
        const newAnnouncement = new Announcement({
          title,
          message,
        });
        const createdAnnouncement = await newAnnouncement.save();
        res.status(201).json(createdAnnouncement);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create announcement' });
      }
};

module.exports = { makeAnnouncement };
