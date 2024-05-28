const express = require("express");
const {getTopics} = require("./controllers/index")

const app = express();

app.get("/api/topics", getTopics);

module.exports = app