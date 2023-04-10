const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Url = require("../models/url");
const api = supertest(app);
const helper = require("./test_helper");
const puppeteer = require("puppeteer");
const config = require("../utils/config");
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
  test("adds a new url with valid input", async () => {
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

  test("returns a 400 status with invalid input", async () => {
    await api.post("/api/url").send({ url: helper.invaildUrl }).expect(400);

    const response = await api.get("/api/url");
    expect(response.body).toHaveLength(helper.initialUrls.length);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
