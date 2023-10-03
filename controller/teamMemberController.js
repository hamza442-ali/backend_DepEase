const TeamMember = require('../model/teamMemberModel.js');

// Controller function for adding a team member
const addTeamMember = async (req, res) => {
  try {
    //Extract the member details from the request body
    const { student_id, team_lead_id, student_name, student_email, student_status, requirements,projectid ,student_role} = req.body;

//     console.log("image"+ req.files.image);
//     const file= req.files.image;
  
//     // Use the mv() method to place the file somewhere on your server
//     file.mv('./uploads\\' + file.name);
//  const image=file.name;




    // Create a new team member instance using the TeamMember model
    const member = new TeamMember({
      student_id,
      team_lead_id,
      student_name,
      student_email,
      student_status,
      requirements,
      projectid,
      student_role,
      // image
    });

    // Save the new team member to the database
    await member.save();

    res.status(200).json({ message: 'Team member added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add team member' });
  }
};

// Controller function for deleting a team member
const deleteTeamMember = async (req, res) => {
  try {
    const {projectid,student_id} = req.params;
   
    const teamMember = await TeamMember.findOneAndDelete({ projectid, student_id });

    if (teamMember) {
      res.json({ message: 'Team member deleted successfully' });
    } else {
      res.status(404).json({ error: 'Team member not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete team member' });
  }
};

// Controller function for getting all team members by project ID
const getAllTeamMembers = async (req, res) => {
  const { projectid } = req.params;

  try {
    const teamMembers = await TeamMember.find({ projectid });
    res.json(teamMembers);
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
};





// Controller function for finding one team member by ID
const getTeamMemberById = async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    if (teamMember) {
      res.json(teamMember);
    } else {
      res.status(404).json({ error: 'Team member not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team member' });
  }
};



// Controller function for assigning a role to a team member
const assignRoleToTeamMember = async (req, res) => {
    try {
      const teamMember = await TeamMember.findByIdAndUpdate(
        req.params.id,
        { student_role: req.body.student_role },
        { new: true }
      );
      if (teamMember) {
        res.json(teamMember);
      } else {
        res.status(404).json({ error: 'Team member not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to assign role to team member' });
    }
  };
  
  // Controller function for assigning the above requirements to a team member
const assignRequirementsToTeamMember = async (req, res) => {
    try {
      const { requirements } = req.body;
      const teamMember = await TeamMember.findByIdAndUpdate(
        req.params.id,
        { requirements },
        { new: true }
      );
      if (teamMember) {
        res.json(teamMember);
      } else {
        res.status(404).json({ error: 'Team member not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to assign requirements to team member' });
    }
  };
  
  
  module.exports = {
    addTeamMember,
    deleteTeamMember,
    getAllTeamMembers,
    getTeamMemberById,
    assignRoleToTeamMember,
    assignRequirementsToTeamMember,
  };
  