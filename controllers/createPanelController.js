
const Panel = require("../models/createPanelModel.js");

const createPanel = (req, res) => {
    console.log("create panel route")
    // Validate request
    if (!req.body.id) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    
    // Create a Panel
    const panel = new Panel({
        id: req.body.id,
        teachers: req.body.teachers,
    });
    
    // Save Panel in the database
    panel
        .save(panel)
        .then((data) => {
        res.send(data);
        })
        .catch((err) => {
        res.status(500).send({
            message:
            err.message ||
            "Some error occurred while creating the Panel.",
        });
        });
    }

// Retrieve all Panels from the database.
getAllPanels = (req, res) => {
    const id = req.query.id;
    var condition = id ? { id: { $regex: new RegExp(id), $options: "i" } } : {};
    
    Panel.find(condition)
        .then((data) => {
        res.send(data);
        })
        .catch((err) => {
        res.status(500).send({
            message:
            err.message || "Some error occurred while retrieving panels.",
        });
        });
    };

    // delete panel using id
     deletePanelByID = (req, res) => {
        const id = req.query.id;
        var condition = id ? { id: { $regex: new RegExp(id), $options: "i" } } : {};
        
        Panel.deleteOne(condition)
            .then((data) => {
            res.send(data);
            })
            .catch((err) => {
            res.status(500).send({
                message:
                err.message || "Some error occurred while deleting panel.",
            });
            });
        }



    module.exports = {

         createPanel,
         getAllPanels,
        deletePanelByID

    }