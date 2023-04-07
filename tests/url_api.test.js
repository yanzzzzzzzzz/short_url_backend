const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Url = require("../models/url");
const api = supertest(app);

const initialUrls = [
  {
    originUrl: "https://chat.openai.com/chat",
    shortUrl: "AAAAAA",
  },
  {
    originUrl: "https://github.com/yanzzzzzzzzz",
    shortUrl: "yanzzzzzzzzz",
  },
];

beforeEach(async () => {
  await Url.deleteMany({});
  let urlObject = new Url(initialUrls[0]);
  await urlObject.save();
  urlObject = new Url(initialUrls[1]);
  await urlObject.save();
});
test("url are returned as json", async () => {
  await api
    .get("/api/url")
    .expect(200)
    .expect("Content-Type", /application\/json/);
}, 100000);

test("there are X url", async () => {
  const response = await api.get("/api/url");

  expect(response.body).toHaveLength(2);
});

test("the first url is about HTTP methods", async () => {
  const response = await api.get("/api/url");

  expect(response.body[0].shortUrl).toBe("AAAAAA");
  expect(response.body[1].shortUrl).toBe("yanzzzzzzzzz");
});

afterAll(() => {
  mongoose.connection.close();
});
