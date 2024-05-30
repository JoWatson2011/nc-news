const { fetchUsers, fetchUserById } = require("../models/users");
exports.getUsers = (req, res, next) => {
  fetchUsers().then((users) => {
    res.status(200).send({ users });
  });
};

exports.getUserById = (req, res, next) => {
  const { username } = req.params;

  fetchUserById(username).then((user) => {
    res.status(200).send({ user });
  });
};
