const express = require("express");
const { getTopics, getEndpoints } = require("./controllers/index");

const app = express();

app.get("/api", getEndpoints)

app.get("/api/topics", getTopics);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Route not found" });
});

module.exports = app;
