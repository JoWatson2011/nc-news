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

describe("GET /api/articles/:id", () => {
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

describe("GET /api/articles", () => {
  test("200: Responds with all the articles as an array of objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((res) => {
        expect(res.body.articles.length).toBe(13);

        res.body.articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test("200: Articles are sorted by date in descending order by default", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((res) => {
        expect(res.body.articles).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: Responds with the comments for the specified article_id", () => {
    const expectedComments = [
      {
        body: "This is a bad article name",
        votes: 1,
        author: "butter_bridge",
        article_id: 6,
        created_at: "2020-10-11T15:23:00.000Z",
        comment_id: 16,
      },
    ];
    return request(app)
      .get("/api/articles/6/comments")
      .expect(200)
      .then((res) => {
        expect(res.body.comments).toEqual(expectedComments);
      });
  });
  test("200: Responds with the comments ordered with most recent first", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((res) => {
        expect(res.body.comments).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("200: Responds with an empty array if passed an article_id that has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then((res) => {
        expect(res.body.comments).toEqual([]);
      });
  });
  test("404: Responds with Not Found if the article_id does not exist", () => {
    return request(app)
      .get("/api/articles/2000/comments")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toEqual("Not Found");
      });
  });
  test("400: Responds with Bad Request when passed an articl_id that is not a number", () => {
    return request(app)
      .get("/api/articles/notANumber/comments")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad Request");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: Responds with the added comment", () => {
    const newComment = { username: "butter_bridge", body: "Wow" };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(201)
      .then((res) => {
        expect(res.body.comment).toMatchObject({
          article_id: 2,
          author: newComment.username,
          body: newComment.body,
          comment_id: expect.any(Number),
          created_at: expect.any(String),
          votes: expect.any(Number),
        });
      });
  });
  test("404: Responds with User Not Found when the username is not found in the database", () => {
    const newCommentnewUser = {
      username: "PerdHapley",
      body: "What I think about this article is undecided",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newCommentnewUser)
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("User Not Found");
      });
  });
  test("404: Responds with Not Found when article_id is not found", () => {
    const newComment = { username: "butter_bridge", body: "Wow" };

    return request(app)
      .post("/api/articles/200/comments")
      .send(newComment)
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Not Found");
      });
  });
  test("400: Responds with Bad Request when fields are missing from request body", () => {
    const newComment = { username: "butter_bridge" };

    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad Request");
      });
  });
  test("404: Responds with Not Found if the article_id does not exist", () => {
    return request(app)
      .post("/api/articles/2000/comments")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toEqual("Not Found");
      });
  });
  test("400: Responds with Bad Request when passed an article_id that is not a number", () => {
    return request(app)
      .post("/api/articles/notANumber/comments")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad Request");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("200: Add votes to the article when votes is a postive number, without altering the other article properties", () => {
    const updatesForArticle = {
      votes: 100,
    };

    return request(app)
      .patch("/api/articles/7")
      .send(updatesForArticle)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: 7,
          title: "Z",
          topic: "mitch",
          author: "icellusedkars",
          body: "I was hungry.",
          created_at: "2020-01-07T14:08:00.000Z",
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          votes: 100,
        });
      });
  });
  test("200: Subtracts votes to the article when votes is a negative number, without altering the other article properties", () => {
    const updatesForArticle = {
      votes: -50,
    };

    return request(app)
      .patch("/api/articles/1")
      .send(updatesForArticle)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 50,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("400: Responds with Bad Request when the votes property is missing from the request body", () => {
    return request(app)
      .patch("/api/articles/7")
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("400: Responds with Bad Request when the votes property is not an integer", () => {
    const updatesForArticle = {
      votes: "notanumber",
    };
    return request(app)
      .patch("/api/articles/7")
      .send(updatesForArticle)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("404: Responds with Not Found if the article_id does not exist", () => {
    return request(app)
      .patch("/api/articles/2000")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toEqual("Not Found");
      });
  });
  test("400: Responds with Bad Request when passed an article_id that is not a number", () => {
    return request(app)
      .patch("/api/articles/notANumber")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad Request");
      });
  });
});

describe.only("DELETE /api/comments/:comment_id", () => {
  test("200: Deletes the comment of the specified comment_id", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then(() => {
        return request(app)
          .get("/api/articles/9/comments")
          .expect(200)
          .then(({ body }) => {
            console.log("I'm in the get statememt");
            expect(body.comments.length).toBe(1);
          });
      });
  });
  test("200: Returns no content in response body", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });
});
