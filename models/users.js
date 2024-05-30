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
      if (!rows.length) {
        return Promise.reject({
          status: 404,
          msg: `Not Found: username ${username}`,
        });
      }
      return rows[0];
    });
};
