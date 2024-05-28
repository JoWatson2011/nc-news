const { getTopics } = require("./topics.controller");
const { getEndpoints } = require("./api.controller");
const { getArticlesById } = require("./articles.controller");
module.exports = { getTopics, getEndpoints, getArticlesById };
