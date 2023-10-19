
const students = require ("../models/studentModel");

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

module.exports = {

    getAllStudents
}