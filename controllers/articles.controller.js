const {
  fetchArticleById,
  fetchArticles,
  checkArticleExists,
  addVotes,
} = require("../models/articles");
const { fetchComments, addComment } = require("../models/comments");
const { checkUserExists } = require("../models/users");
const { checkExists } = require("../models/utils");
exports.getArticlesById = (req, res, next) => {
  const { article_id } = req.params;

  fetchArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article: article[0] });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticles = (req, res, next) => {
  const { topic } = req.query;

  Promise.all([checkExists("topics", "slug", topic), fetchArticles(topic)])
    .then((promiseArr) => {
      const checkTopic = promiseArr[0];

      const articles = promiseArr[1];

      return checkTopic ? checkTopic : articles;
    })
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticleComments = (req, res, next) => {
  const { article_id } = req.params;

  checkArticleExists(article_id)
    .then((res) => {
      return fetchComments(article_id);
    })
    .then((comments) => {
      res.status(200).send({ comments: comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postArticleComments = (req, res, next) => {
  const { article_id } = req.params;
  const comment = req.body;
  checkArticleExists(article_id)
    .then(() => {
      return checkUserExists(comment.username);
    })
    .then(() => {
      return addComment(article_id, comment);
    })
    .then((newComment) => {
      res.status(201).send({ comment: newComment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { votes } = req.body;

  checkArticleExists(article_id)
    .then(() => {
      return addVotes(article_id, votes);
    })
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
