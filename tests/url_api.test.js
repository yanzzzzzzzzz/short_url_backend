const supertest = require('supertest');
const app = require('../app');
const Url = require('../models/url');
const api = supertest(app);
const helper = require('./test_helper');
const config = require('../utils/config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../Service/RedisService');
const mongoose = require('mongoose');
let testUser = { username: 'test', email: 'test@gmail.com', password: '1234' };
let testUser2 = { username: 'test2', email: 'test2@gmail.com', password: '1234' };
let cookie, cookie2;
let savedUser, savedUser2;
const createUser = async (userData) => {
  const passwordHash = await bcrypt.hash(userData.password, 10);
  const user = new User({
    username: userData.username,
    email: userData.email,
    passwordHash
  });
  return user.save();
};

const addUrlsToUser = async (user, urls) => {
  const urlPromises = urls.map(async (url) => {
    const urlModel = new Url({
      originUrl: url.originUrl,
      shortUrl: url.shortUrl,
      title: url.title,
      user: user._id
    });
    await urlModel.save();
  });

  await Promise.all(urlPromises);
};

beforeEach(async () => {
  await User.deleteMany({});
  await Url.deleteMany({});

  savedUser = await createUser(testUser);

  savedUser2 = await createUser(testUser2);

  await addUrlsToUser(savedUser, helper.initialUrls);
  const loginResponse = await api
    .post('/api/login')
    .send({ email: testUser.email, password: testUser.password })
    .expect(200);
  cookie = loginResponse.headers['set-cookie'];

  const loginResponse2 = await api
    .post('/api/login')
    .send({ email: testUser2.email, password: testUser2.password })
    .expect(200);
  cookie2 = loginResponse2.headers['set-cookie'];
}, 50000);

describe('GET /api/url', () => {
  test('should return urls as JSON', async () => {
    const response = await api.get('/api/url').set('Cookie', cookie).expect(200);

    expect(response.body.content.length).toBe(helper.initialUrls.length);
  }, 50000);
  test('search keyword return right result', async () => {
    const urlAtStart = await helper.urlsInDb();
    const keyword = 'myblog';
    const response = await api
      .get(`/api/url?searchKeyword=${keyword}`)
      .set('Cookie', cookie)
      .expect(200);

    expect(response.body.content.length).toBe(
      urlAtStart.filter((u) => u.title.toLowerCase().includes(keyword.toLowerCase())).length
    );
  }, 50000);
  test('paginate', async () => {
    const urlAtStart = await helper.urlsInDb();
    const pageSize = 3;
    const response = await api
      .get(`/api/url?page=0&pageSize=${pageSize}`)
      .set('Cookie', cookie)
      .expect(200);

    let len;
    if (urlAtStart.length <= pageSize) {
      len = urlAtStart.length;
    } else {
      len = pageSize;
    }
    expect(response.body.content.length).toBe(len);
  }, 50000);
  test('Attempt to access a non-existent short URL', async () => {
    await api.get(`/api/url/thisUrlNotExist`).expect(404);
  });
});

describe('POST /api/url', () => {
  test('adds a new url with valid input', async () => {
    const urlsAtStart = await Url.find({ user: savedUser._id.toString() });
    await api
      .post('/api/url')
      .set('Cookie', cookie)
      .send({ url: helper.vaildUrl })
      .expect(201)
      .expect('Content-Type', /application\/json/);
    const urlsAtEnd = await Url.find({ user: savedUser._id.toString() });

    expect(urlsAtEnd).toHaveLength(urlsAtStart.length + 1);
  });

  test('returns a 400 status with invalid input', async () => {
    const urlsAtStart = await Url.find({ user: savedUser._id.toString() });
    await api.post('/api/url').set('Cookie', cookie).send({ url: helper.invaildUrl }).expect(400);
    const urlsAtEnd = await Url.find({ user: savedUser._id.toString() });
    expect(urlsAtEnd).toHaveLength(urlsAtStart.length);
  });

  test('adding a new url with valid input but no token provided is okay', async () => {
    const urlsAtStart = await Url.find({});
    await api.post('/api/url').send({ url: helper.vaildUrl }).expect(201);

    const allUrls = await Url.find({});
    expect(allUrls).toHaveLength(urlsAtStart.length + 1);
  });

  test('add a new url with duplicate short url should return error', async () => {
    const allUrls = await Url.find({});
    await api
      .post('/api/url')
      .set('Cookie', cookie)
      .send({ url: allUrls[0].originUrl, customShortUrl: allUrls[0].shortUrl })
      .expect(409)
      .expect('Content-Type', /application\/json/);
  });

  test('add a new url with custom short url should return ok', async () => {
    const customShortUrl = '213qweasd';
    await api
      .post('/api/url')
      .set('Cookie', cookie)
      .send({ url: helper.vaildUrl, customShortUrl })
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const myCreatedUrl = await Url.findOne({ shortUrl: customShortUrl });
    expect(myCreatedUrl).not.toBeNull();
    expect(myCreatedUrl.shortUrl).toEqual(customShortUrl);
  });
});

describe('DELETE api/url', () => {
  test('should remove an existing URL', async () => {
    const urlAtStart = await helper.urlsInDb();
    const urlToDelete = urlAtStart[0];
    await api.delete(`/api/url/${urlToDelete.shortUrl}`).set('Cookie', cookie).expect(204);
    const urlAtEnd = await helper.urlsInDb();
    expect(urlAtEnd).toHaveLength(helper.initialUrls.length - 1);

    const existShortUrl = urlAtEnd.map((url) => url.shortUrl);
    expect(existShortUrl).not.toContain(urlToDelete.shortUrl);
  });
  test("User can't delete another user create url", async () => {
    const urlAtStart = await helper.urlsInDb();
    const urlToDelete = urlAtStart[0];
    await api.delete(`/api/url/${urlToDelete.shortUrl}`).set('Cookie', cookie2).expect(403);
    const urlAtEnd = await helper.urlsInDb();
    expect(urlAtEnd).toHaveLength(helper.initialUrls.length);
  });
});

describe('PUT api/url', () => {
  test("shortUrl can update an existing URL's original URL", async () => {
    const urlAtStart = await helper.urlsInDb();
    const urlToUpdate = urlAtStart[0];
    await api
      .put(`/api/url/${urlToUpdate.shortUrl}`)
      .send({ originUrl: helper.vaildUrl, shortUrl: helper.updateShortUrl })
      .set('Cookie', cookie)
      .expect(200);
    const urlAtEnd = await helper.urlsInDb();
    expect(urlAtEnd).toHaveLength(helper.initialUrls.length);

    expect(urlAtEnd[0].originUrl).toBe(helper.vaildUrl);
    expect(urlAtEnd[0].shortUrl).toBe(helper.updateShortUrl);
  });
});

describe('PATCH', () => {
  test('update short url and title', async () => {
    const urlAtStart = await helper.urlsInDb();
    const urlToUpdate = urlAtStart[0];
    const updateTitle = 'sadewq';
    await api
      .patch(`/api/url/${urlToUpdate.shortUrl}`)
      .send({ newShortUrl: helper.updateShortUrl, newTitle: updateTitle })
      .set('Cookie', cookie)
      .expect(200);
    const urlAtEnd = await helper.urlsInDb();
    expect(urlAtEnd).toHaveLength(helper.initialUrls.length);

    expect(urlAtEnd[0].shortUrl).toBe(helper.updateShortUrl);
    expect(urlAtEnd[0].title).toBe(updateTitle);
  });

  test('just update title is ok', async () => {
    const urlAtStart = await helper.urlsInDb();
    const urlToUpdate = urlAtStart[0];
    const updateTitle = 'sadewq';
    await api
      .patch(`/api/url/${urlToUpdate.shortUrl}`)
      .send({ newTitle: updateTitle })
      .set('Cookie', cookie)
      .expect(200);
    const urlAtEnd = await helper.urlsInDb();
    expect(urlAtEnd).toHaveLength(helper.initialUrls.length);

    expect(urlAtEnd[0].shortUrl).toBe(urlAtStart[0].shortUrl);
    expect(urlAtEnd[0].title).toBe(updateTitle);
  });

  test('just update no duplicate short url is okay', async () => {
    const urlAtStart = await helper.urlsInDb();
    const urlToUpdate = urlAtStart[0];
    await api
      .patch(`/api/url/${urlToUpdate.shortUrl}`)
      .send({ newShortUrl: helper.updateShortUrl })
      .set('Cookie', cookie)
      .expect(200);
    const urlAtEnd = await helper.urlsInDb();
    expect(urlAtEnd).toHaveLength(helper.initialUrls.length);
    expect(urlAtEnd[0].shortUrl).toBe(helper.updateShortUrl);
  });

  test('update duplicate short url will failed', async () => {
    const urlAtStart = await helper.urlsInDb();
    const urlToUpdate = urlAtStart[0];
    await api
      .patch(`/api/url/${urlToUpdate.shortUrl}`)
      .send({ newShortUrl: urlAtStart[1].shortUrl })
      .set('Cookie', cookie)
      .expect(409);
  });

  test('update same short url but different title', async () => {
    const urlAtStart = await helper.urlsInDb();
    const urlToUpdate = urlAtStart[0];
    const updateTitle = 'sadewq';
    await api
      .patch(`/api/url/${urlToUpdate.shortUrl}`)
      .send({ newShortUrl: urlToUpdate.shortUrl, newTitle: updateTitle })
      .set('Cookie', cookie)
      .expect(200);
    const urlAtEnd = await helper.urlsInDb();
    expect(urlAtEnd).toHaveLength(helper.initialUrls.length);

    expect(urlAtEnd[0].shortUrl).toBe(urlAtStart[0].shortUrl);
    expect(urlAtEnd[0].title).toBe(updateTitle);
  });
});

afterEach(async () => {
  await User.deleteMany({});
  await Url.deleteMany({});
});

afterAll(async () => {
  await redisClient.disconnect();
  await mongoose.connection.close();
});
