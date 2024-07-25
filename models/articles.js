const { off } = require("../app");
const db = require("../db/connection");
exports.fetchArticleById = (article_id) => {
  return db
    .query(
      `SELECT articles.*, CAST(COUNT(comments.comment_id) AS integer) AS comment_count FROM comments
      RIGHT JOIN articles 
      ON articles.article_id = comments.article_id 
      WHERE articles.article_id = $1
      GROUP BY articles.article_id
      ORDER BY created_at DESC;`,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `Not Found: article_id ${article_id}`,
        });
      } else {
        return rows[0];
      }
    });
};

exports.fetchArticles = (topic, sort_by, order, p, limit) => {
  if (!sort_by) {
    sort_by = "created_at";
  }
  if (!order) {
    order = "desc";
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
    "comment_count",
  ];

  if (!sortByValid.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Bad Request: sort_by" });
  }

  if (!["asc", "desc"].includes(order)) {
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
  ORDER BY ${sort_by} ${order.toUpperCase()} `;

  if (p || limit) {
    limit = limit ? limit : 10; // default parameter instead?
    if (!p) {
      p = 1;
      if (isNaN(parseInt(limit))) {
        return Promise.reject({ status: 400, msg: "Bad Request: limit" });
      }
    }
    if (isNaN(parseInt(p))) {
      return Promise.reject({ status: 400, msg: "Bad Request: p" });
    }
    // also check for NaN

    const sqlParamsIndex = topic ? 2 : 1;

    sqlParams.push(limit);
    sqlQuery += `LIMIT $${sqlParamsIndex} `;

    const offsetVal = p * limit - limit;

    if (offsetVal > 0) {
      sqlParams.push(offsetVal);
      sqlQuery += `OFFSET $${sqlParamsIndex + 1}`;
    }
  }

  sqlQuery += ";";
  return db.query(sqlQuery, sqlParams).then(({ rows }) => {
    return rows;
  });
};

exports.addArticle = (newArticle) => {
  const { title, topic, author, body, article_img_url } = newArticle;

  return db
    .query(
      `INSERT INTO articles (title, topic, author, body${
        article_img_url ? ", article_img_url" : ""
      })
    VALUES 
    ($1, $2, $3, $4${article_img_url ? ", $5" : ""})
    RETURNING *`,
      [
        title,
        topic,
        author,
        body,
        ...(article_img_url ? [article_img_url] : []),
      ]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};
