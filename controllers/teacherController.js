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
        teacher.Designation= req.body.Designation;
        teacher.email = req.body.email;
        teacher.mobile = req.body.mobile;
        teacher.profilePicture = req.body.profilePicture;
        teacher.passoword = req.body.password;
        


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

// update teacher isSelected 

const updateTeacherIsSelected = async (req, res) => {
    console.log(req.body)
    const teachersToUpdate = req.body;

    try {
        // Use updateMany to update the isSelected field for multiple teachers
        const result = await Teacher.updateMany(
            { employeeId: { $in: teachersToUpdate.map((teacher) => teacher.employeeId) } },
            { $set: { isSelected: true } }
        );  

        // if (result.nModified === teachersToUpdate.length) {
        //     res.json({ message: 'Teachers updated successfully' });
        // } else {
        //     res.status(500).json({ error: 'Failed to update all teachers' });
        // }
    } catch (error) {
        console.error('Error updating teachers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateIsSelectedFalse = async (req, res) => {
    console.log(req.body)
    const teachersToUpdate = req.body.teachers;

    try {
        // Use updateMany to update the isSelected field for multiple teachers
        const result = await Teacher.updateMany(
            { employeeId: { $in: teachersToUpdate.map((teacher) => teacher.employeeId) } },
            { $set: { isSelected: false } }
        );  

       
    } catch (error) {
        console.error('Error updating teachers:', error);
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
    updateTeacherIsSelected,
    updateIsSelectedFalse
};
