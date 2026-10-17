const gitlab = require('../integrations/gitlab/client');
const { asyncHandler } = require('../utils/async-handler');

exports.home = asyncHandler(async (req, res) => {
  res.json(await gitlab.listMemberProjects());
});

exports.check = (req, res) => res.json('it is working fine');
