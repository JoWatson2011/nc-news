const db = require("../db/connection");
exports.fetchArticleById = (article_id) => {
  return db
    .query(
      `SELECT * FROM articles
    WHERE article_id = $1;`,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not Found" });
      } else {
        return rows;
      }
    });
};

exports.fetchArticles = (topic) => {
  let sqlQuery = `SELECT articles.author, articles.title, articles.article_id, articles.topic,
       articles.created_at, articles.votes, articles.article_img_url, 
       COUNT(comments.comment_id) AS comment_count FROM comments
      RIGHT JOIN articles 
      ON articles.article_id = comments.article_id `;
  const sqlParams = [];

  if (topic) {
    sqlQuery += `WHERE articles.topic = $1 `;
    sqlParams.push(topic);
  }

  sqlQuery += `GROUP BY articles.author, articles.title, articles.article_id, articles.topic,
       articles.created_at, articles.votes,articles.article_img_url
      ORDER BY created_at DESC;`;
  return db.query(sqlQuery, sqlParams).then(({ rows }) => {
    return rows.map((row) => {
      const comment_count = row.comment_count;
      return { ...row, comment_count: Number(comment_count) };
    });
  });
};

exports.addVotes = (article_id, votes) => {
  return db
    .query(
      `UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *;`,
      [votes, article_id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};
