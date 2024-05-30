const commentsRouter = require("express").Router();
const { deleteComment } = require("../controllers/index");

commentsRouter.delete("/:comment_id", deleteComment);

module.exports = commentsRouter;
