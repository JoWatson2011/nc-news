const { getTopics } = require("./topics.controller");
const { getEndpoints } = require("./api.controller");
const {
  getArticlesById,
  getArticles,
  getArticleComments,
  postArticleComments,
  patchArticle
} = require("./articles.controller");
const {deleteComment} = require("./comments.controller")
const { getUsers, getUserById } = require("./users.controller");

module.exports = {
  getTopics,
  getEndpoints,
  getArticlesById,
  getArticles,
  getArticleComments,
  postArticleComments,
  patchArticle,
  deleteComment,
  getUsers,
  getUserById
};
