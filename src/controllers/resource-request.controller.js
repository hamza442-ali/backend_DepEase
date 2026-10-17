const ResourceRequest = require('../models/resource-request.model');
const { createCrudHandlers } = require('./crud-handlers');
const handlers = createCrudHandlers(ResourceRequest, 'Resource request');

const { dateRange } = require('../utils/validation');
exports.createResourceRequest = handlers.create((req) => {
  dateRange(req.body.startDate, req.body.endDate);
  return req.body;
});
exports.getResourceRequests = handlers.list();
exports.listProjectResourceRequests = handlers.list((req) => ({
  projectId: req.params.projectId,
}));
exports.listTeacherResourceRequests = handlers.list((req) => ({
  TeacherId: req.params.TeacherId,
}));
exports.getResourceRequestById = handlers.get();
exports.updateResourceRequest = handlers.update();
exports.deleteResourceRequest = handlers.remove();
