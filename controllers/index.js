const { getTopics } = require("./topics.controller");
const { getEndpoints } = require("./api.controller");
const { getArticlesById, getArticles } = require("./articles.controller");
module.exports = { getTopics, getEndpoints, getArticlesById, getArticles };
