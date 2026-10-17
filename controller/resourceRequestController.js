const Model = require('../model/resourceRequestModel');
const { crud } = require('../src/crud');
const handlers = crud(Model, 'Resource request');

const { dateRange } = require('../src/validation');
exports.createResourceRequest = handlers.create(req => {
  dateRange(req.body.startDate, req.body.endDate);
  return req.body;
});
exports.getResourceRequests = handlers.list();
exports.getResourceRequestsbyProjectid = handlers.list(req => ({ projectId: req.params.projectId }));
exports.getResourceRequestsbyTeacherid = handlers.list(req => ({ TeacherId: req.params.TeacherId }));
exports.getResourceRequestById = handlers.get();
exports.updateResourceRequest = handlers.update();
exports.deleteResourceRequest = handlers.remove();
