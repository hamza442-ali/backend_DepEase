const FYPProject = require('../model/evaluationModel.js');

const fypProject = {
  project_id: "1",
  title: "Mern Stack FYP Project",
  description: "This is a basically a Web Applicatin for hosting fyp projects",
  teamMembers: ["Mian Abdullah", "Ali Hamza","Mahad Rahat"],
  teamlead_id: "2",
  supervisor: "Dr. Robert Johnson",
  evaluationCriteria: [
    { name: "Innovation", weight: 0.2, score: 8 },
    { name: "Technical Complexity", weight: 0.3, score: 7 },
    { name: "Implementation", weight: 0.2, score: 9 },
    { name: "Documentation", weight: 0.15, score: 8 },
    { name: "Collaboration", weight: 0.1, score: 9 },
    { name: "Timeliness", weight: 0.05, score: 7 },
  ],
  presentation: {
    content: 8,
    delivery: 9,
    visuals: 7,
  },
  innovation: 8,
  technicalComplexity: 7,
  implementation: 9,
  documentation: 8,
  collaboration: 9,
  timeliness: 7,
  overallScore: 8,
};


class FYPProjectController {
  static async createFYPProject(req, res) {
    try {
      const fypProjectData = req.body;
      const fypProject = await FYPProject.create(fypProjectData);
      res.status(201).json(fypProject);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create FYP project' });
    }
  }

  static async updateFYPProject(req, res) {
    try {
      const { id } = req.params;
      const fypProjectData = req.body;
      const fypProject = await FYPProject.findByIdAndUpdate(id, fypProjectData, { new: true });
      res.status(200).json(fypProject);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update FYP project' });
    }
  }

   static async getAllEvaluation  (req, res)  {
    // const { projectid } = req.params;
  
    try {
      // const fypProject = await FYPProject.find({ projectid });
      res.json(fypProject);
      
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch team members' });
    }
  };

}








module.exports = FYPProjectController;
