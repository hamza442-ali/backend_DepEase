
const students = require ("../models/studentModel");

//create student
const createStudent = async (req, res) => {
    console.log("Student creation route", req.body)
    try {
        
        req.body.profilePicture = "hamza.jpg"
        
        console.log("After Modification", req.body)

        const student = new students();

        // Assign each field individually
        student.name = req.body.name;
        student.registration_number = req.body.registration_number;
        student.email_address = req.body.email_address;
        student.degree = req.body.degree;
        student.section = req.body.section;
        student.gender = req.body.gender;
        student.profilePicture = req.body.profilePicture;
        student.password = req.body.password;

        // Save the student document
        await student.save();

        res.status(201).json(student);
    } catch (error) {
        console.log("Error", error)
        res.status(500).json({ error: 'Failed to create students' });
    }
};








// get all students
const getAllStudents = (req, res) => {
    students.find()
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({ message: err.message || "Error Occurred" });
        });
};

// Delete Student by ID
const deleteStudentById = async (req, res) => {
    console.log("In delete student function", req.params.id)

    try {

        const Student = await students.deleteOne({ registration_number: req.params.id });


        if (!Student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};





module.exports = {

    getAllStudents,
    createStudent,
    deleteStudentById 
}