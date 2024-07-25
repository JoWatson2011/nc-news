const { getTopics, postTopic } = require("./topics.controller");
const { getEndpoints } = require("./api.controller");
const {
  getArticlesById,
  getArticles,
  getArticleComments,
  postArticleComments,
  patchArticle,
  postArticle,
} = require("./articles.controller");
const { deleteComment, patchComment } = require("./comments.controller");
const { getUsers, getUserById } = require("./users.controller");

module.exports = {
  getTopics,
  postTopic,
  getEndpoints,
  getArticlesById,
  getArticles,
  getArticleComments,
  postArticleComments,
  patchArticle,
  deleteComment,
  getUsers,
  getUserById,
  patchComment,
  postArticle,
};
