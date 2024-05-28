const request = require("supertest");
const connection = require("../db/connection");
const seed = require("../db/seeds/seed.js");
const app = require("../app.js");
const {
  articleData,
  commentData,
  topicData,
  userData,
} = require("../db/data/test-data/index.js");

beforeEach(() => {
  return seed({ topicData, userData, articleData, commentData });
});

afterAll(() => connection.end());

describe("", () =>{
    test('should ', () => {
        
    });
})