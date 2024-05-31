const {
  fetchArticleById,
  fetchArticles,
  addArticle,
} = require("../models/articles");
const { fetchComments, addComment } = require("../models/comments");
const { checkExists, addVotes, getTotalCount } = require("../models/utils");
exports.getArticlesById = (req, res, next) => {
  const { article_id } = req.params;

  fetchArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article: article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticles = (req, res, next) => {
  const { topic, sort_by, order, p, limit } = req.query;

  Promise.all([
    checkExists("topics", "slug", topic),
    fetchArticles(topic, sort_by, order, p, limit),
  ])
    .then((promiseArr) => {
      const checkTopic = promiseArr[0];

      const articles = promiseArr[1];

      return checkTopic ? checkTopic : articles;
    })
    .then((articles) => {
      if (!p) res.status(200).send({ articles });
      return Promise.all([articles, getTotalCount("articles")]);
    })
    .then((promiseArr) => {
      const articles = promiseArr[0];
      const total_count = promiseArr[1];
      res.status(200).send({ articles, total_count });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticleComments = (req, res, next) => {
  const { article_id } = req.params;

  checkExists("articles", "article_id", article_id)
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
  checkExists("articles", "article_id", article_id)
    .then(() => {
      return checkExists("users", "username", comment.username);
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

  checkExists("articles", "article_id", article_id)
    .then(() => {
      return addVotes("articles", "article_id", article_id, votes);
    })
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postArticle = (req, res, next) => {
  const newArticle = req.body;

  checkExists("users", "username", newArticle.author)
    .then(() => {
      return checkExists("topics", "slug", newArticle.topic);
    })
    .then(() => {
      return addArticle(newArticle);
    })
    .then((postedArticle) => {
      return fetchArticleById(postedArticle.article_id);
    })
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
