const db = require("../db/connection");

exports.fetchTopics = () => {
  return db.query("SELECT * FROM topics;").then(({ rows }) => {
    return rows;
  });
};

exports.addTopic = (slug, description) => {
  return db
    .query(
      `
    INSERT INTO topics (slug, description)
    VALUES ($1, $2)
    RETURNING *;
    `,
      [slug, description]
    )
    .then(({ rows }) => {
      return rows[0];
    })
    .catch((err) => {
      if (err.code === "23505")
        return Promise.reject({
          status: 400,
          msg: "Bad Request: Duplicate topic",
        });
    });
};
