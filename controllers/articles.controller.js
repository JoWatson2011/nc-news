const {
  fetchArticleById,
  fetchArticles,
  checkArticleExists,
} = require("../models/articles");
const { fetchComments, addComment } = require("../models/comments");
const {checkUserExists} = require("../models/users")

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
  fetchArticles().then((articles) => {
    res.status(200).send({ articles: articles });
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
      next(err)
    });
};
