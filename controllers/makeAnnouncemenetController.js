
const Announcement = require('../models/makeAnnouncementModel');



const makeAnnouncement = async (req, res) => {

  console.log(req.body, " Annoncement Data")
    try {
        const { title, richText } = req.body;
        const newAnnouncement = new Announcement({
          title,
          richText,
        });
        const createdAnnouncement = await newAnnouncement.save();
        res.status(201).json(createdAnnouncement);
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to create announcement' });
      }
};


// get all anoucnemnts 
const getAnnouncement = async (req, res) => {
  try {
    const announcements = await Announcement.find({});
    res.json(announcements);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to get announcements' });
  }
};

// delete announcement by id
const deleteAnnouncement = async (req, res) => {
  const announcementId = req.params.id;

  try {
    // Find the announcement by ID and remove it
    const deletedAnnouncement = await Announcement.findByIdAndRemove(announcementId);

    if (!deletedAnnouncement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json({ message: 'Announcement removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to remove announcement' });
  }
};


module.exports = { makeAnnouncement, getAnnouncement, deleteAnnouncement };
