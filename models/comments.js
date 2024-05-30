const db = require("../db/connection");

exports.fetchComments = (article_id) => {
  return db
    .query(
      `SELECT * FROM comments 
    WHERE article_id = $1
    ORDER BY created_at DESC;`,
      [article_id]
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.addComment = (article_id, comment) => {
  return db
    .query(
      `INSERT INTO comments (body, article_id, author)
        VALUES ($1, $2, $3)
        RETURNING *`,
      [comment.body, article_id, comment.username]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.removeCommentById = (comment_id) => {
  return db.query(
    `DELETE FROM comments 
  WHERE comment_id = $1
  RETURNING *`,
    [comment_id]
  ).then(({rows}) => {
    if(!rows.length){
      return Promise.reject({status: 404, msg: `Not Found: comment ${comment_id}` })
    }
  })
};
