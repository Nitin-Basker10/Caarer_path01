const { buildCareerPath } = require("../utils/careerLogic");

exports.generateCareerPath = (req, res) => {
  const input = req.body;
  const result = buildCareerPath(input);
  res.json(result);
};
