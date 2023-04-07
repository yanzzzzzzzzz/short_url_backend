const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);

test("url are returned as json", async () => {
  await api
    .get("/api/url")
    .expect(200)
    .expect("Content-Type", /application\/json/);
}, 100000);

test("there are X url", async () => {
  const response = await api.get("/api/url");

  expect(response.body).toHaveLength(12);
});

test("the first url is about HTTP methods", async () => {
  const response = await api.get("/api/url");

  expect(response.body[0].shortUrl).toBe("AAAAAA");
});

afterAll(() => {
  mongoose.connection.close();
});
