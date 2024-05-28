const { fetchArticle } = require("../models/articles");

exports.getArticlesById = (req, res, next) => {
  const { id } = req.params;

  fetchArticle(id)
    .then((article) => {
      res.status(200).send({ article: article[0] });
    })
    .catch((err) => {
      next(err);
    });
};
