const { fetchTopics, addTopic } = require("../models/topics");

exports.getTopics = (req, res, next) => {
  fetchTopics().then((topicData) => {
    res.status(200).send({ topics: topicData });
  });
};

exports.postTopic = (req, res, next) => {
  const { slug, description } = req.body;
  addTopic(slug, description)
    .then((topicData) => {
      res.status(201).send({ topic: topicData });
    })
    .catch((err) => {
      next(err);
    });
};
