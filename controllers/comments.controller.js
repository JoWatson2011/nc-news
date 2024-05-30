const { removeCommentById } = require("../models/comments");
const {addVotes, checkExists} = require("../models/utils")
exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;

  removeCommentById(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchComment = (req, res, next) => {
  const { comment_id } = req.params;
  const { votes } = req.body;

  checkExists("comments", "comment_id", comment_id).then(()=>{
    return addVotes("comments", "comment_id", comment_id, votes)
  })
  .then((comment)=> {
    res.status(200).send({comment})
  }).catch((err) => {
    next(err)
  });
};
