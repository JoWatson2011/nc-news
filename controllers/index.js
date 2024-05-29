const { getTopics } = require("./topics.controller");
const { getEndpoints } = require("./api.controller");
const {
  getArticlesById,
  getArticles,
  getArticleComments,
} = require("./articles.controller");
module.exports = {
  getTopics,
  getEndpoints,
  getArticlesById,
  getArticles,
  getArticleComments,
};
