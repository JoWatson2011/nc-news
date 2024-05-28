const { fetchTopics } = require("../models/topics");

exports.getTopics = (req, res, next) => {
fetchTopics()
  .then((topicData) => {
    console.log("then controller")
    res.status(200).send({ topics: topicData });
  });
};
