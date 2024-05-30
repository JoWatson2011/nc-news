const express = require("express");
const {
  getTopics,
  deleteComment,
  getUsers
} = require("./controllers/index");

const {apiRouter, articlesRouter} = require("./routes/index.js")

const app = express();

app.use(express.json());

app.use("/api", apiRouter)

app.use("/api/articles", articlesRouter)

app.get("/api/topics", getTopics);

app.delete("/api/comments/:comment_id", deleteComment);

app.get("/api/users", getUsers)

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Route not found" });
});

app.use((err, req, res, next) => {
  if (["22P02", "23502"].includes(err.code)) {
    res.status(400).send({ msg: "Bad Request" });
  } else next(err);
});

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
});
module.exports = app;
