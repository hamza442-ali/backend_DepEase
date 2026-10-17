// Compatibility facade for the original CRUD helper.
const { createCrudHandlers } = require('./controllers/crud-handlers');
module.exports = { crud: createCrudHandlers, createCrudHandlers };
