
const Panel = require("../models/createPanelModel.js");
const assignPanel = require("../models/panelAssignmentModel.js")

const createPanel = (req, res) => {
    // console.log("create panel route")
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



        const AssignPanel = (req, res) => {
            console.log("create panel route", req.body.studentIds, req.body.panelId);
          
            // Validate request
            if (!req.body.studentIds || !req.body.panelId) {
              res.status(400).send({ message: "Content can not be empty!" });
              return;
            }
          
            // Create a new AssignmentPanel document
            const assignment = new assignPanel({
              studentIds: req.body.studentIds,
              panelId: req.body.panelId,
            });
          
            // Save the document to the database
            assignment.save()
              .then((data) => {
                res.status(201).send(data); // 201 for resource created
              })
              .catch((err) => {
                res.status(500).send({
                  message: err.message || "Some error occurred while creating the AssignmentPanel.",
                });
              });
          };

          // editPanelIdByid
          const editPanelIdByid = (req, res) => {
            const idToUpdate = req.params.id; 
            const newPanelId = req.body.newPanelId; 
          console.log(idToUpdate, newPanelId, " IDs")
            if (!newPanelId) {
              return res.status(400).send({ message: "New panel ID is required." });
            }
          
            Panel.findOneAndUpdate(
              { id: idToUpdate },
              { $set: { id: newPanelId } },
              { new: true }
            )
              .then((updatedPanel) => {
                if (!updatedPanel) {
                  return res.status(404).send({ message: "Panel not found." });
                }
          
                res.send(updatedPanel);
              })
              .catch((err) => {
                res.status(500).send({
                  message:
                    err.message ||
                    "Some error occurred while updating the panel's ID.",
                });
              });
          };
          














    module.exports = {

         createPanel,
         getAllPanels,
        deletePanelByID,
        AssignPanel,
        editPanelIdByid

    }