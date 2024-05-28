exports.getEndpoints = (req, res, next) => {
  res.status(200).send({ endpoints: require("../endpoints.json") });
};
