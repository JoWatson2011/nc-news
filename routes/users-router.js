const usersRouter = require("express").Router();
const { getUsers } = require("../controllers/index");

usersRouter.get("/", getUsers);

module.exports = usersRouter;
