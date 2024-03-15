const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Url = require("../models/url");
const api = supertest(app);
const helper = require("./test_helper");
const puppeteer = require("puppeteer");
const config = require("../utils/config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

let token = null;
let testUserName = "test";
beforeEach(async () => {
  await User.deleteMany({});
  await Url.deleteMany({});
  const passwordHash = await bcrypt.hash("1234", 10);
  const user = new User({
    username: testUserName,
    passwordHash,
  });

  const savedUser = await user.save();

  const promises = helper.initialUrls.map(async (url) => {
    const urlModel = new Url({
      originUrl: url.originUrl,
      shortUrl: url.shortUrl,
      user: savedUser._id,
    });
    const savedUrl = await urlModel.save();
    savedUser.urls.push(savedUrl._id);
  });

  await Promise.all(promises);
  await savedUser.save();

  const userToken = { username: testUserName, id: savedUser.id };
  token = jwt.sign(userToken, config.SECRET);
}, 50000);

describe("GET /api/url", () => {
  test("should return urls as JSON", async () => {
    const response = await api
    .get("/api/url")
    .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(helper.initialUrls.length);
  }, 50000);
});

describe("URL shortener", () => {
  let browser, page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  test("should redirect to correct URL", async () => {
    const urlAtStart = await helper.urlsInDb();
    const urlToView = urlAtStart[0];
    const url = urlToView.originUrl;
    const shortUrl =
      `http://localhost:${config.PORT}/api/url/` + urlToView.shortUrl;

    await page.goto(shortUrl);

    const redirectedUrl = await page.url();

    expect(redirectedUrl).toBe(url);
  }, 500000);
});

describe("POST /api/url", () => {
  test("adds a new url with valid input", async () => {
    await api
      .post("/api/url")
      .set("Authorization", `bearer ${token}`)
      .send({ url: helper.vaildUrl })
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const allUrls = await Url.find({});
    const originUrls = allUrls.map((r) => r.originUrl);

    expect(allUrls).toHaveLength(helper.initialUrls.length + 1);
    expect(originUrls).toContain(helper.vaildUrl);
  });

  test("returns a 400 status with invalid input", async () => {
    await api
      .post("/api/url")
      .set("Authorization", `bearer ${token}`)
      .send({ url: helper.invaildUrl })
      .expect(400);

    const allUrls = await Url.find({});
    expect(allUrls).toHaveLength(helper.initialUrls.length);
  });

  test("adding a new url with valid input but no token provided is okay", async () => {
    await api.post("/api/url").send({ url: helper.vaildUrl }).expect(201);

    const allUrls = await Url.find({});
    expect(allUrls).toHaveLength(helper.initialUrls.length + 1);
  });
});

describe("DELETE api/url", () => {
  test("should remove an existing URL", async () => {
    const urlAtStart = await helper.urlsInDb();
    const urlToDelete = urlAtStart[0];
    await api
    .delete(`/api/url/${urlToDelete.shortUrl}`)
    .set("Authorization", `bearer ${token}`)
    .expect(204);
    const urlAtEnd = await helper.urlsInDb();
    expect(urlAtEnd).toHaveLength(helper.initialUrls.length - 1);

    const existShortUrl = urlAtEnd.map((url) => url.shortUrl);
    expect(existShortUrl).not.toContain(urlToDelete.shortUrl);
  });
});

describe("PUT api/url", () => {
  test("shortUrl can update an existing URL's original URL", async () => {
    const urlAtStart = await helper.urlsInDb();
    const urlToUpdate = urlAtStart[0];
    await api
      .put(`/api/url/${urlToUpdate.shortUrl}`)
      .send({ originUrl: helper.vaildUrl, shortUrl: helper.updateShortUrl })
      .set("Authorization", `bearer ${token}`)
      .expect(200);
    const urlAtEnd = await helper.urlsInDb();
    expect(urlAtEnd).toHaveLength(helper.initialUrls.length);

    expect(urlAtEnd[0].originUrl).toBe(helper.vaildUrl);
    expect(urlAtEnd[0].shortUrl).toBe(helper.updateShortUrl);
  });
});