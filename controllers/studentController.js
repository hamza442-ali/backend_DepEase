
const students = require ("../models/studentModel");

//create student
const createStudent = async (req, res) => {
    console.log("Student creation route", req.body)
    try {
        
        // req.body.profilePicture = "hamza.jpg"
        
        console.log("After Modification", req.body)

        const student = new students();

        // Assign each field individually
        student.student_name = req.body.student_name;
        student.registration_number = req.body.registration_number;
        student.email_address = req.body.email_address;
        student.password = req.body.password;
        student.phone_number = req.body.phone_number;
        student.batch= req.body.batch;
        student.semester= req.body.semester;
        student.department = req.body.department;


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