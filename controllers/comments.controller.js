const { removeCommentById } = require("../models/comments");

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;

  removeCommentById(comment_id)
  .then(() => {
    res.status(204).send()
  })
  .catch((err) => {
    next(err)
  });
};
