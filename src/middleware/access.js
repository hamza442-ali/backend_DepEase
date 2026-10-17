const { ROLES, STAFF_ROLES } = require('../constants/roles');
const { requireRoles } = require('./authorize-roles');

const admin = requireRoles(ROLES.ADMIN);
const staff = requireRoles(...STAFF_ROLES);

module.exports = { admin, staff };
