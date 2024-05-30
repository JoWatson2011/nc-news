const db = require("../db/connection");
exports.fetchArticleById = (article_id) => {
  return db
    .query(
      `SELECT articles.*, CAST(COUNT(comments.comment_id) AS integer) AS comment_count FROM comments
      RIGHT JOIN articles 
      ON articles.article_id = comments.article_id 
      WHERE comments.article_id = $1
      GROUP BY articles.article_id
      ORDER BY created_at DESC;`,
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

exports.fetchArticles = (topic, sort_by,order) => {
  if (!sort_by) {
    sort_by = "created_at";
  }
  if(!order) {
    order = "desc"
  }

  const sortByValid = [
    "article_id",
    "title",
    "topic",
    "author",
    "body",
    "created_at",
    "votes",
    "article_img_url",
  ];

  
  if (!sortByValid.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Bad Request: sort_by" });
  }
  
  if(!["asc", "desc"].includes(order)){
     return Promise.reject({ status: 400, msg: "Bad Request: order" });
  }

  let sqlQuery = `SELECT articles.*, CAST(COUNT(comments.comment_id) AS integer) AS comment_count FROM comments
      RIGHT JOIN articles 
      ON articles.article_id = comments.article_id `;
  const sqlParams = [];

  if (topic) {
    sqlQuery += `WHERE articles.topic = $1 `;
    sqlParams.push(topic);
  }

  sqlQuery += `GROUP BY articles.article_id
      ORDER BY ${sort_by} ${order.toUpperCase()};`;

  return db.query(sqlQuery, sqlParams).then(({ rows }) => {
    return rows;
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
