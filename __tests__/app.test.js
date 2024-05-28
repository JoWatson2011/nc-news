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
  test("200: Responds with description of the endpoints listed in endpoints.json", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((res) => {
        for (endpoint in res.body.endpoints) {
          const endpointsFile = require("../endpoints.json");

          return request(app)
            .get("/api")
            .expect(200)
            .then((res) => {
              expect(res.body.endpoints).toEqual(endpointsFile);
            });
        }
      });
  });
});

describe("GET /api/articles", () => {
  test("200: Responds with an article object of the queried id", () => {
    const expectedArticle = {
      article_id: 1,
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      created_at: "2020-07-09T20:11:00.000Z",
      votes: 100,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };

    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((res) => {
        expect(res.body.article).toEqual(expectedArticle);
      });
  });
  test("404: Responds with Not Found when passed an id that isn't in the articles table", () => {
    return request(app)
      .get("/api/articles/300")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Not Found");
      });
  });
  test("400: Responds with Bad Request when passed an id that is not a number", () => {
    return request(app)
      .get("/api/articles/notANumber")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad Request");
      });
  });
});
