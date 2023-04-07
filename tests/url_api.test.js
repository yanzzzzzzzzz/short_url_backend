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
test("GET /api/url should return urls as JSON", async () => {
  await api
    .get("/api/url")
    .expect(200)
    .expect("Content-Type", /application\/json/);
}, 100000);

test("GET /api/url should return the correct number of urls", async () => {
  const response = await api.get("/api/url");

  expect(response.body).toHaveLength(initialUrls.length);
});

test("GET /api/url should return initial urls", async () => {
  const response = await api.get("/api/url");
  let index = 0;
  initialUrls.forEach((url) => {
    expect(response.body[index].originUrl).toBe(url.originUrl);
    expect(response.body[index++].shortUrl).toBe(url.shortUrl);
  });
});

test("a valid url can be added", async () => {
  const newUrl = "https://www.google.com.tw/";
  await api
    .post("/api/url")
    .send({ url: newUrl })
    .expect(201)
    .expect("Content-Type", /application\/json/);
  const response = await api.get("/api/url");

  const originUrls = response.body.map((r) => r.originUrl);

  expect(response.body).toHaveLength(initialUrls.length + 1);
  expect(originUrls).toContain(newUrl);
});
afterAll(() => {
  mongoose.connection.close();
});
