const SuperAnnouncement = require('../model/announcement_S_Model');

// Controller to add a new announcement
exports.addAnnouncement = async (req, res) => {
  try {
    const { title, content, TeacherId, ProjectId } = req.body;
    
    // Create a new announcement
    const newAnnouncement = new SuperAnnouncement({
      title,
      content,
      TeacherId,
      ProjectId,
    });

    // Save the announcement to the database
    const savedAnnouncement = await newAnnouncement.save();

    res.json(savedAnnouncement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Controller to get announcements by ProjectId
exports.getAnnouncementsByProjectId = async (req, res) => {
  try {
    const { ProjectId } = req.params;

    // Find announcements by ProjectId
    const announcements = await SuperAnnouncement.find({ ProjectId });

    res.json(announcements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
