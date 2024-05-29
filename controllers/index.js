const { getTopics } = require("./topics.controller");
const { getEndpoints } = require("./api.controller");
const {
  getArticlesById,
  getArticles,
  getArticleCommentsById,
} = require("./articles.controller");
module.exports = {
  getTopics,
  getEndpoints,
  getArticlesById,
  getArticles,
  getArticleCommentsById,
};
