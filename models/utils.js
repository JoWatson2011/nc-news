const db = require("../db/connection");
const format = require("pg-format");

exports.checkExists = (table, column, value) => {
  const queryStr = format("SELECT * FROM %I WHERE %I = $1;", table, column);
  return db.query(queryStr, [value]).then(({ rows }) => {
    if (rows.length === 0 && value) {
      return Promise.reject({ status: 404, msg: `Not Found: ${value}` });
    }
  });
};

exports.addVotes = (table, column, value, votes) => {
  const queryStr = format(
    `UPDATE %I
    SET votes = votes + $1
    WHERE %I = $2
    RETURNING *;`, table, column);

  return db
    .query(
      queryStr,
      [votes, value]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.getTotalCount = (table) => {
  const sqlQuery = format("SELECT * FROM %I;", table);
  return db
    .query(sqlQuery)
    .then(({ rows }) => {
      return rows.length;
    })
    .catch((err) => console.log(err));
}