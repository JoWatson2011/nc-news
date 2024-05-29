const { getTopics } = require("./topics.controller");
const { getEndpoints } = require("./api.controller");
const {
  getArticlesById,
  getArticles,
  getArticleComments,
  postArticleComments,
} = require("./articles.controller");
module.exports = {
  getTopics,
  getEndpoints,
  getArticlesById,
  getArticles,
  getArticleComments,
  postArticleComments,
};
