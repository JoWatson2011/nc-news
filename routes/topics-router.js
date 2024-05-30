const topicsRouter = require("express").Router();
const { getTopics } = require("../controllers/index");

topicsRouter.get("/", getTopics);

module.exports = topicsRouter;
