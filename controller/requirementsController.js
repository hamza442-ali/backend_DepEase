const Requirement = require('../model/requirmentsModel.js');

// Controller function for creating a new requirement
const createRequirement = async (req, res) => {
  // try {
let formData;
  if(req.body.comments){
    formData = {
      title: req.body.title,
      priority: req.body.priority,
      assignedTo: JSON.parse(req.body.assignedTo),
      status: req.body.status,
      description: req.body.description,
      deadline: req.body.deadline,
      attachments: req.body.attachments,
      comments: JSON.parse(req.body.comments),
      writtenby: req.body.writtenby,
      projectid: req.body.projectid
    };

   }else{
    formData = {
      title: req.body.title,
      priority: req.body.priority,
      assignedTo: JSON.parse(req.body.assignedTo),
      status: req.body.status,
      description: req.body.description,
      deadline: req.body.deadline,
      attachments: req.body.attachments,
      writtenby: req.body.writtenby,
      projectid: req.body.projectid
    };
   }

    const requirement = await Requirement.create(formData);
    res.status(201).json(requirement);
  // } catch (error) {
  //   res.status(500).json({ error: 'Failed to create requirement' });
  // }
};


// Controller function for getting all requirements by projectId
const getAllRequirements = async (req, res) => {
  const { projectid } = req.params;
  
  try {
    const requirements = await Requirement.find({ projectid });
    res.json(requirements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requirements' });
  }
};

// Controller function for getting a single requirement by ID
const getRequirementById = async (req, res) => {
  try {
    console.log("projectid" + req.param.id)
    const requirement = await Requirement.findById(req.params.id);
    if (requirement) {
      res.json(requirement);
    } else {
      res.status(404).json({ error: 'Requirement not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requirement' });
  }
};

// Controller function for updating a requirement
const updateRequirement = async (req, res) => {
  try {
    const requirement = await Requirement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (requirement) {
      res.json(requirement);
    } else {
      res.status(404).json({ error: 'Requirement not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update requirement' });
  }
};

// Controller function for deleting a requirement
const deleteRequirement = async (req, res) => {
  try {
    const requirement = await Requirement.findByIdAndDelete(req.params.id);
    if (requirement) {
      res.json({ message: 'Requirement deleted successfully' });
    } else {
      res.status(404).json({ error: 'Requirement not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete requirement' });
  }
};

// Controller function for updating the priority of a requirement
const updatePriority = async (req, res) => {
    try {
      const requirement = await Requirement.findByIdAndUpdate(
        req.params.id,
        { priority: req.body.priority },
        { new: true }
      );
      if (requirement) {
        res.json(requirement);
      } else {
        res.status(404).json({ error: 'Requirement not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to update priority' });
    }
  };
  
// Controller function for updating the deadline of a requirement
const updateDeadline = async (req, res) => {
    try {
      const requirement = await Requirement.findByIdAndUpdate(
        req.params.id,
        { deadline: req.body.deadline },
        { new: true }
      );
      if (requirement) {
        res.json(requirement);
      } else {
        res.status(404).json({ error: 'Requirement not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to update deadline' });
    }
  };
  
// Controller function for uploading an attachment to a requirement
const uploadAttachment = async (req, res) => {
  try {
    const requirement = await Requirement.findById(req.params.id);
    if (requirement) {
      requirement.attachments.push(req.body.attachment);
      const updatedRequirement = await requirement.save();
      res.json(updatedRequirement);
    } else {
      res.status(404).json({ error: 'Requirement not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload attachment' });
  }
};



// Controller function for adding a comment to a requirement
const addComment = async (req, res) => {
    try {
      const { content, createdBy } = req.body;
      const requirement = await Requirement.findById(req.params.id);
      if (requirement) {
        const comment = {
          content,
          createdBy,
        };
        requirement.comments.push(comment);
        const updatedRequirement = await requirement.save();
        res.json(updatedRequirement);
      } else {
        res.status(404).json({ error: 'Requirement not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to add comment' });
    }
  };
  
  // Controller function for fetching all comments of a requirement
  const getAllComments = async (req, res) => {
    try {
      const requirement = await Requirement.findById(req.params.id);
      if (requirement) {
        const comments = requirement.comments;
        res.json(comments);
      } else {
        res.status(404).json({ error: 'Requirement not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  };
  






module.exports = {
  createRequirement,
  getAllRequirements,
  getRequirementById,
  updateRequirement,
  deleteRequirement,
  updatePriority,
  updateDeadline,
  uploadAttachment,
  addComment,
  getAllComments,

};
