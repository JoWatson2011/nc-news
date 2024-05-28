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

describe("General error handling", () => {
  test("404: request to a route/endpoint that does not exist", () => {
    return request(app)
      .get("/api/catTopics")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Route not found");
      });
  });
});

describe("GET /api/topics", () => {
  test("200: Responds with all topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((res) => {
        expect(res.body.topics.length).toBe(3);

        res.body.topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api", () => {
  test("200: Responds with all the endpoints listed in endpoints.json", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((res) => {
        for (endpoint in res.body.endpoints) {
          expect(res.body.endpoints[endpoint]).toMatchObject({
            description: expect.any(String),
            queries: expect.any(Array),
            exampleResponse: expect.any(Object),
          });
        }
      });
  });
});
