const articlesRouter = require("express").Router();
const {
  getArticlesById,
  getArticles,
  getArticleComments,
  postArticleComments,
  patchArticle,
  postArticle,
} = require("../controllers/index");

articlesRouter.route("/").get(getArticles).post(postArticle);

articlesRouter.route("/:article_id").get(getArticlesById).patch(patchArticle);

articlesRouter
  .route("/:article_id/comments")
  .get(getArticleComments)
  .post(postArticleComments);

module.exports = articlesRouter;
