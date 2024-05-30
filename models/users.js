const db = require("../db/connection");

exports.fetchUsers = () => {
  return db.query(`SELECT * FROM users;`).then(({ rows }) => {
    return rows;
  });
};

exports.fetchUserById = (username) => {
  return db
    .query(
      `
  SELECT * FROM users
  WHERE username = $1;
  `,
      [username]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};
