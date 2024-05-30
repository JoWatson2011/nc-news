const articlesRouter = require("express").Router();
const {
  getArticlesById,
  getArticles,
  getArticleComments,
  postArticleComments,
  patchArticle,
} = require("../controllers/index");

articlesRouter.get("/", getArticles);

articlesRouter.route("/:article_id").get(getArticlesById).patch(patchArticle);

articlesRouter
  .route("/:article_id/comments")
  .get(getArticleComments)
  .post(postArticleComments);

module.exports = articlesRouter;
