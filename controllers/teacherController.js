const Teacher = require('../models/teacherModel');


// create teacher
const createTeacher = async (req, res) => {
    console.log("Teacher creation route", req.body)
    try {

        
        
        req.body.profilePicture = "hamza.jpg"
        
        console.log("After Modification", req.body)

        const teacher = new Teacher();

        // Assign each field individually
        teacher.name = req.body.name;
        teacher.employeeId = req.body.employeeId;
        teacher.education = req.body.education;
        teacher.email = req.body.email;
        teacher.mobile = req.body.mobile;
        teacher.gender = req.body.gender;
        teacher.profilePicture = req.body.profilePicture;
        teacher.password = req.body.password;

        // Save the teacher document
        await teacher.save();

        res.status(201).json(teacher);
    } catch (error) {
        console.log("Error", error)
        res.status(500).json({ error: 'Failed to create teacher' });
    }
};


// Get all teachers
const getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get teacher by ID
const getTeacherById = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        res.json(teacher);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete teacher by ID
const deleteTeacherById = async (req, res) => {
    console.log("In delete teacher function", req.params.id)

    try {

        const teacher = await Teacher.deleteOne({ employeeId: req.params.id });


        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        res.json({ message: 'Teacher deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Edit teacher by ID
const editTeacherById = async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        res.json(teacher);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllTeachers,
    getTeacherById,
    deleteTeacherById,
    editTeacherById,
    createTeacher,
};
