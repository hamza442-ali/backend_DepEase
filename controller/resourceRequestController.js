const ResourceRequest = require('../model/resourceRequestModel');

exports.createResourceRequest = async (req, res) => {
    try {
        const resourceRequest = new ResourceRequest(req.body);
        await resourceRequest.save();
        res.status(201).json(resourceRequest);
    } catch (error) {
        
        res.status(500).json({ error: error.message });
    }
};

exports.getResourceRequests = async (req, res) => {
    try {
        const resourceRequests = await ResourceRequest.find();
        res.status(200).json(resourceRequests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



exports.getResourceRequestsbyProjectid = async (req, res) => {
    const { projectId } = req.params;
    try {
        const resourceRequests = await ResourceRequest.find({ projectId });
      res.status(200).json(resourceRequests);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch resource request' });
    }
};


exports.getResourceRequestById = async (req, res) => {
    try {
        const resourceRequest = await ResourceRequest.findById(req.params.id);
        if (!resourceRequest) {
            return res.status(404).json({ error: 'Resource Request not found' });
        }
        res.status(200).json(resourceRequest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateResourceRequest = async (req, res) => {
    const { id } = req.params;
    try {
        const resourceRequest = await ResourceRequest.findByIdAndUpdate(id, req.body, { new: true });
    
        if (!resourceRequest) {
            return res.status(404).json({ error: 'Resource Request not found' });
        }
        res.status(200).json(resourceRequest);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
    
};

exports.deleteResourceRequest = async (req, res) => {
    try {
        const resourceRequest = await ResourceRequest.findByIdAndDelete(req.params.id);
        if (!resourceRequest) {
            return res.status(404).json({ error: 'Resource Request not found' });
        }
        res.status(200).json({ message: 'Resource Request deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
