const Announcement = require('../model/announcement_A_Model');

// Controller to get all announcements
const getAllAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find();
        
        res.json(announcements);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getAllAnnouncements,
};
