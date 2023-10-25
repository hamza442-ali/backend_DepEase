const Group = require('../model/groupModel');

// Controller for creating a new group
exports.createGroup = async (req, res) => {
  try {
    const { teamLeadId, teammate1Id, teammate2Id} = req.body;
    const group = new Group({
      teamLeadId,
      teammate1Id,
      teammate2Id
    });
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for fetching all groups
exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate('teamLead members');
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for fetching a specific group by ID
exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('teamLead members');
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for updating a group by ID
exports.updateGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for deleting a group by ID
exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.status(200).json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
