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
describe("POST /api/topics", () => {
  test("201: Responds with newly added topic", () => {
    const newTopic = { slug: "dogs", description: "woof" };
    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(201)
      .then((res) => {
        expect(res.body.topic).toMatchObject({
          slug: "dogs",
          description: "woof",
        });
      });
  });
  test("400: Responds with Bad Request: Duplicate topic when topic already exists in database", () => {
    const newTopic = { slug: "cats", description: "already here" };
    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: Duplicate topic");
      });
  });
  test("400: Responds with Bad Request: Malformed when fields are missing", () => {
    const newTopic = { description: "dogs" };
    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: Malformed");
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

describe("GET /api/articles/:article_id", () => {
  test("200: Responds with an article object of the queried id", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((res) => {
        expect(res.body.article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("200: Responds with the number of comments for the speicified article on a key of comment_count", () => {
    return request(app)
      .get("/api/articles/9")
      .expect(200)
      .then((res) => {
        expect(res.body.article.comment_count).toEqual(2);
      });
  });
  test("200: Responds with 0 on the comment_count key when article has no comments", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then((res) => {
        expect(res.body.article.comment_count).toEqual(0);
      });
  });
  test("404: Responds with Not Found: article_id <article_id> when passed an id that isn't in the articles table", () => {
    return request(app)
      .get("/api/articles/300")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Not Found: article_id 300");
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
      .then(({ body }) => {
        expect(body.articles.length).toBe(13);

        body.articles.forEach((article) => {
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
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("200: When passed a valid topic query responds with articles of that topic", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(1);

        expect(body.articles[0]).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: expect.any(Number),
          topic: "cats",
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
          comment_count: expect.any(Number),
        });
      });
  });
  test("200: Responds with an empty array no articles for a valid topic query", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toEqual([]);
      });
  });
  test("404: Responds with Not Found: <topicQuery> when topic query is not valid - i.e. not found in topic table", () => {
    return request(app)
      .get("/api/articles?topic=32")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found: 32");
      });
  });
  test("200: Responds with articles sorted by specified column (in descending order by default) when given a sort_by query", () => {
    return request(app)
      .get("/api/articles?sort_by=votes")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("votes", { descending: true });
      });
  });
  test("400: Responds with Bad request: sort_by when passed a sort_by query that is not a valid column", () => {
    return request(app)
      .get("/api/articles?sort_by=notvalid")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: sort_by");
      });
  });
  test("200: Responds with articles sorted in ascending created_at date (by default) when passed an order query of asc", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at");
      });
  });
  test("400: Responds with Bad Request: order when order query is not asc or desc.", () => {
    return request(app)
      .get("/api/articles?order=notanorder")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: order");
      });
  });
  test("200: Handles where, sort_by and order queries in the same request", () => {
    return request(app)
      .get("/api/articles?topic=mitch&sort_by=votes&order=asc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("votes");
        body.articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  test("200: Responds with the first 10 articles and total_count property when page (p) query is 1", () => {
    return request(app)
      .get("/api/articles?p=1")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(10);
        expect(body.total_count).toBe(13);
      });
  });
  test("200: Responds with the last articles and total_count property when page (p) query is 2 and total_count is not divisible by 10", () => {
    return request(app)
      .get("/api/articles?p=2")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(3);
        expect(body.total_count).toBe(13);
      });
  });
  test("200: Responds with the first x articles and total_count property when p is 1 and limit is x", () => {
    return request(app)
      .get("/api/articles?p=1&limit=3")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(3);

        body.articles.forEach((article) => {
          expect([3, 6, 2].includes(article.article_id)).toBeTruthy();
        });

        expect(body.total_count).toBe(13);
      });
  });
  test("200: Responds with the second x articles and total_count property when p is >1 and limit is x", () => {
    return request(app)
      .get("/api/articles?p=2&limit=3")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(3);

        body.articles.forEach((article) => {
          expect([12, 13, 5].includes(article.article_id)).toBeTruthy();
        });

        expect(body.total_count).toBe(13);
      });
  });
  test("200: Handles topic, p and limit in the same request", () => {
    return request(app)
      .get("/api/articles?p=1&limit=3&topic=mitch")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(3);

        body.articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });

        expect(body.total_count).toBe(12);
      });
  });
  test ("200: total_count is equal to the number of articles of that topic, when a topic query is provided.", () => {
    return request(app)
      .get("/api/articles?p=1&topic=cats")
      .expect(200)
      .then(({ body }) => {
        expect(body.total_count).toBe(1);
      });
  });
   test("200: Responds with the first x articles and total_count property when p isn't queried and limit is x", () => {
     return request(app)
       .get("/api/articles?limit=3")
       .expect(200)
       .then(({ body }) => {
         expect(body.articles).toHaveLength(3);
         expect(body.total_count).toBe(13);
       });
   });
  test("400: Responds with Bad Request: p if p is not a number", () => {
    return request(app)
      .get("/api/articles?p=cats")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: p");
      });
  });
  test("400: Responds with Bad Request: limit if limit is not a number", () => {
    return request(app)
      .get("/api/articles?limit=cats")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: limit");
      });
  });
  test("404: Responds with Not found if page is out of bounds", () => {
    return request(app)
      .get("/api/articles?p=50")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
});

describe("POST /api/articles/", () => {
  test("201: Responds with the added article with default article_img_url when it is not provided", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "miaow",
      body: "miaow",
      topic: "cats",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          author: newArticle.author,
          title: newArticle.title,
          body: newArticle.body,
          topic: newArticle.topic,
          article_img_url:
            "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
          article_id: 14,
          votes: 0,
          created_at: expect.any(String),
          comment_count: 0,
        });
      });
  });
  test("201: Responds with the added article with specified article_img_url", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "miaow",
      body: "miaow",
      topic: "cats",
      article_img_url:
        "https://img.icons8.com/?size=100&id=823&format=png&color=000000",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          author: newArticle.author,
          title: newArticle.title,
          body: newArticle.body,
          topic: newArticle.topic,
          article_img_url:
            "https://img.icons8.com/?size=100&id=823&format=png&color=000000",
          article_id: 14,
          votes: 0,
          created_at: expect.any(String),
          comment_count: 0,
        });
      });
  });
  test("404: Responds with Not Found: <username> when the username is not found in the database", () => {
    const newArticle = {
      author: "MrMan",
      title: "miaow",
      body: "miaow",
      topic: "cats",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found: MrMan");
      });
  });
  test("404: Responds with Not Found: <topic> when topic is not found", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "miaow",
      body: "miaow",
      topic: "butter",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found: butter");
      });
  });
  test("400: Responds with Bad Request when fields are missing from request body", () => {
    const newArticle = {
      body: "miaow",
      topic: "cats",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
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
  test("404: Responds with Not Found: <article_id> if the article_id does not exist", () => {
    return request(app)
      .get("/api/articles/2000/comments")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toEqual("Not Found: 2000");
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
  test("404: Responds with Not Found: <username> when the username is not found in the database", () => {
    const newCommentnewUser = {
      username: "PerdHapley",
      body: "What I think about this article is undecided",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newCommentnewUser)
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Not Found: PerdHapley");
      });
  });
  test("404: Responds with Not Found: <article_id> when article_id is not found", () => {
    const newComment = { username: "butter_bridge", body: "Wow" };

    return request(app)
      .post("/api/articles/200/comments")
      .send(newComment)
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Not Found: 200");
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
  test("404: Responds with Not Found: <article_id> if the article_id does not exist", () => {
    return request(app)
      .post("/api/articles/2000/comments")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toEqual("Not Found: 2000");
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
  test("404: Responds with Not Found: <article_id> if the article_id does not exist", () => {
    return request(app)
      .patch("/api/articles/2000")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toEqual("Not Found: 2000");
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

describe("DELETE /api/comments/:comment_id", () => {
  test("204: Deletes the comment of the specified comment_id", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then(() => {
        return request(app)
          .get("/api/articles/9/comments")
          .expect(200)
          .then(({ body }) => {
            expect(body.comments.length).toBe(1);
          });
      });
  });
  test("204: Returns no content in response body", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });
  test("404: Responds with : <comment_id> if comment_id is valid but does not exist in comments table", () => {
    return request(app)
      .delete("/api/comments/100000")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual("Not Found: comment 100000");
      });
  });
  test("400: Responds with Bad Request if comment_id is not an integer", () => {
    return request(app)
      .delete("/api/comments/notanumber")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual("Bad Request");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("200: Add votes to the comment when votes is a postive number, without altering the other comment properties", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ votes: 10 })
      .expect(200)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 26,
          author: "butter_bridge",
          article_id: 9,
          created_at: "2020-04-06T12:17:00.000Z",
        });
      });
  });
  test("200: Subtracts votes from the comment when votes is a negative number, without altering the other comment properties", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ votes: -10 })
      .expect(200)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 6,
          author: "butter_bridge",
          article_id: 9,
          created_at: "2020-04-06T12:17:00.000Z",
        });
      });
  });
  test("400: Responds with Bad Request when the votes property is missing from the request body", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("400: Responds with Bad Request when the votes property is not an integer", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ votes: "notanumber" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("404: Responds with Not Found: <comment_id> if the comment_id does not exist", () => {
    return request(app)
      .patch("/api/comments/10009")
      .send({ votes: 12 })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found: 10009");
      });
  });
  test("400: Responds with Bad Request when passed a comment_id that is not a number", () => {
    return request(app)
      .patch("/api/comments/notanumber")
      .send({ votes: 12 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});

describe("GET /api/users", () => {
  test("200: Resonds with an array containing all users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body.users.length).toBe(4);

        body.users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/users/:username", () => {
  test("200: Responds with a user object of the specified username", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then(({ body }) => {
        expect(body.user).toMatchObject({
          username: "butter_bridge",
          name: "jonny",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        });
      });
  });
  test("404: Responds with Not Found: username <username> if passed a username that is not found", () => {
    return request(app)
      .get("/api/users/MrMan")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found: username MrMan");
      });
  });
});
