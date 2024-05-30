const apiRouter = require("express").Router();
const { getEndpoints } = require("../controllers/index");

apiRouter.get("/", getEndpoints);

module.exports = apiRouter;
