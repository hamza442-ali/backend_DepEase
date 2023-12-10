const Student = require('../model/studentModel');



exports.getStudent = async (req, res) => {
  try {
    
    registration_number=req.params.id;
    const students = await Student.find({ registration_number});
    res.status(200).json(students);
  } catch (error) {
     res.status(500).json({ error: error.message });
    
  }
};

// Get a single student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) throw new Error('Student not found');
    res.status(200).json(student);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};



// // Student login
// exports.studentLogin = async (req, res) => {
//   const { email_address, password } = req.body;
//   try {
//     const student = await Student.findOne({ email_address, password });
//     if (!student) throw new Error('Invalid email or password');
//     res.status(200).json(student);
//   } catch (error) {
//     res.status(401).json({ error: error.message });
//   }
// };
