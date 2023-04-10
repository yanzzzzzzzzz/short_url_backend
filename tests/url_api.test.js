const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Url = require("../models/url");
const api = supertest(app);
const helper = require("./test_helper");

beforeEach(async () => {
  await Url.deleteMany({});
  let urlObject = new Url(helper.initialUrls[0]);
  await urlObject.save();
  urlObject = new Url(helper.initialUrls[1]);
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

  expect(response.body).toHaveLength(helper.initialUrls.length);
});

test("GET /api/url should return initial urls", async () => {
  const response = await api.get("/api/url");
  let index = 0;
  helper.initialUrls.forEach((url) => {
    expect(response.body[index].originUrl).toBe(url.originUrl);
    expect(response.body[index++].shortUrl).toBe(url.shortUrl);
  });
});

test("POST /api/url a valid url can be added", async () => {
  await api
    .post("/api/url")
    .send({ url: helper.vaildUrl })
    .expect(201)
    .expect("Content-Type", /application\/json/);
  const response = await api.get("/api/url");

  const originUrls = response.body.map((r) => r.originUrl);

  expect(response.body).toHaveLength(helper.initialUrls.length + 1);
  expect(originUrls).toContain(helper.vaildUrl);
});

test("POST /api/url a invalid url can not be added", async () => {
  await api.post("/api/url").send({ url: helper.invaildUrl }).expect(400);

  const response = await api.get("/api/url");
  expect(response.body).toHaveLength(helper.initialUrls.length);
});

afterAll(() => {
  mongoose.connection.close();
});
