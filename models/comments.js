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
        return rows
    });
};

exports.addComment = (article_id, comment) =>{
    return db.query(
        `INSERT INTO comments (body, article_id, author)
        VALUES ($1, $2, $3)
        RETURNING *
        `, [comment.body, article_id, comment.username]
    ).then(({rows}) => {
        return rows[0]
    })
};