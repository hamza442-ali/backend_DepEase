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

// Get all groups
exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find();
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Get a specific group by ID
exports.getGroupByMatching= async (req, res) => {
  const { id } = req.params;
  try {
    const group = await Group.findOne({
      $or: [
        { teamLeadId: id },
        { teammate1Id: id },
        { teammate2Id: id }
      ]
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.status(200).json({ _id: group._id }); // Return the _id of the found group
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Get a specific group by ID
exports.getGroupById = async (req, res) => {
  const { id } = req.params;
  try {
    const group = await Group.findById(id); // Pass the id as a string directly, not within an object

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Update a group by ID
exports.updateGroup = async (req, res) => {
  try {
    const updatedGroup = await Group.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedGroup) {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.status(200).json(updatedGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a group by ID
exports.deleteGroup = async (req, res) => {
  try {
    const deletedGroup = await Group.findByIdAndDelete(req.params.id);
    if (!deletedGroup) {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.status(200).json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};