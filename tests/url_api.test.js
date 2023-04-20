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
beforeEach(async () => {
  await Url.deleteMany({});
  await Url.insertMany(helper.initialUrls);
});

describe("GET /api/url", () => {
  test("should return urls as JSON", async () => {
    await api
      .get("/api/url")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  }, 100000);
  test("should return the correct number of urls", async () => {
    const response = await api.get("/api/url");

    expect(response.body).toHaveLength(helper.initialUrls.length);
  });
  test("should return initial urls", async () => {
    const response = await api.get("/api/url");
    let index = 0;
    helper.initialUrls.forEach((url) => {
      expect(response.body[index].originUrl).toBe(url.originUrl);
      expect(response.body[index++].shortUrl).toBe(url.shortUrl);
    });
  });
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
  let token = null;
  let testUserName = "test";
  beforeAll(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("1234", 10);
    const user = await new User({
      username: testUserName,
      passwordHash,
    }).save();

    const userToken = { username: testUserName, id: user.id };
    return (token = jwt.sign(userToken, config.SECRET));
  });
  test("adds a new url with valid input", async () => {
    await api
      .post("/api/url")
      .set("Authorization", `bearer ${token}`)
      .send({ url: helper.vaildUrl })
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const response = await api.get("/api/url");
    const originUrls = response.body.map((r) => r.originUrl);

    expect(response.body).toHaveLength(helper.initialUrls.length + 1);
    expect(response.body[response.body.length - 1].user.username).toEqual(
      testUserName
    );
    expect(originUrls).toContain(helper.vaildUrl);
  });

  test("returns a 400 status with invalid input", async () => {
    await api
      .post("/api/url")
      .set("Authorization", `bearer ${token}`)
      .send({ url: helper.invaildUrl })
      .expect(400);

    const response = await api.get("/api/url");
    expect(response.body).toHaveLength(helper.initialUrls.length);
  });

  test("rejects adding a new url with valid input but no token provided", async () => {
    await api.post("/api/url").send({ url: helper.vaildUrl }).expect(401);

    const response = await api.get("/api/url");
    expect(response.body).toHaveLength(helper.initialUrls.length);
  });
});

describe("DELETE api/url", () => {
  test("should remove an existing URL", async () => {
    const urlAtStart = await helper.urlsInDb();
    const urlToDelete = urlAtStart[0];
    await api.delete(`/api/url/${urlToDelete.shortUrl}`).expect(204);
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
      .send({ originUrl: helper.vaildUrl })
      .expect(200);
    const urlAtEnd = await helper.urlsInDb();
    expect(urlAtEnd).toHaveLength(helper.initialUrls.length);

    expect(urlAtEnd[0].originUrl).toBe(helper.vaildUrl);
  });
});

describe("PACTH api/url", () => {
  test("Update shortUrl", async () => {
    const urlAtStart = await helper.urlsInDb();
    const urlToPatch = urlAtStart[0];
    await api
      .patch(`/api/url/${urlToPatch.shortUrl}`)
      .send({ newShortUrl: helper.updateShortUrl })
      .expect(200);

    const urlAtEnd = await helper.urlsInDb();

    expect(urlAtEnd[0].shortUrl).not.toEqual(urlToPatch.shortUrl);
    expect(urlAtEnd[0].shortUrl).toBe(helper.updateShortUrl);
  });

  test("Invalid update with existing short URL", async () => {
    const urlAtStart = await helper.urlsInDb();
    const urlToPatch = urlAtStart[0];
    const existUrl = urlAtStart[1];
    await api
      .patch(`/api/url/${urlToPatch.shortUrl}`)
      .send({ newShortUrl: existUrl.shortUrl })
      .expect(409);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
