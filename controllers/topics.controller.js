const { fetchTopics } = require("../models/topics");

exports.getTopics = (req, res, next) => {
fetchTopics()
  .then((topicData) => {
    res.status(200).send({ topics: topicData });
  });
};
