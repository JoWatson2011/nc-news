const express = require("express");
const {
  getTopics,
  getEndpoints,
  getArticlesById,
} = require("./controllers/index");

const app = express();

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticlesById);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Route not found" });
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad Request" });
  } else next(err);
});

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
});
module.exports = app;
