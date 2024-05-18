const supertest = require('supertest');
const app = require('../app');
const Url = require('../models/url');
const api = supertest(app);
const helper = require('./test_helper');
const config = require('../utils/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

let token = null;
let token2 = null;
let testUser = { username: 'test', email: 'test@gmail.com', password: '1234' };
let testUser2 = { username: 'test2', email: 'test2@gmail.com', password: '1234' };
beforeEach(async () => {
  await User.deleteMany({});
  await Url.deleteMany({});
  const passwordHash = await bcrypt.hash(testUser.password, 10);
  const user = new User({
    username: testUser.username,
    email: testUser.email,
    passwordHash
  });
  const savedUser = await user.save();
  token = jwt.sign({ id: savedUser.id }, config.SECRET);

  const user2 = new User({
    username: testUser2.username,
    email: testUser2.email,
    passwordHash
  });
  const savedUser2 = await user2.save();
  token2 = jwt.sign({ id: savedUser2.id }, config.SECRET);

  const promises = helper.initialUrls.map(async (url) => {
    const urlModel = new Url({
      originUrl: url.originUrl,
      shortUrl: url.shortUrl,
      title: url.title,
      user: savedUser._id
    });
    const savedUrl = await urlModel.save();
    savedUser.urls.push(savedUrl._id);
  });

  await Promise.all(promises);
  await savedUser.save();
}, 50000);

describe('GET /api/url', () => {
  test('should return urls as JSON', async () => {
    const response = await api.get('/api/url').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(helper.initialUrls.length);
  }, 50000);
  test('search keyword return right result', async () => {
    const urlAtStart = await helper.urlsInDb();
    const keyword = 'myblog';
    const response = await api
      .get(`/api/url?searchKeyword=${keyword}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(
      urlAtStart.filter((u) => u.title.toLowerCase().includes(keyword.toLowerCase())).length
    );
  }, 50000);
  test('paginate', async () => {
    const urlAtStart = await helper.urlsInDb();
    const pageSize = 3;
    const response = await api
      .get(`/api/url?page=0&pageSize=${pageSize}`)
      .set('Authorization', `Bearer ${token}`);

    let len;
    if(urlAtStart.length <= pageSize){
      len = urlAtStart.length
    }else{
      len = pageSize
    }
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(len);
  }, 50000);
});

describe('POST /api/url', () => {
  test('adds a new url with valid input', async () => {
    await api
      .post('/api/url')
      .set('Authorization', `bearer ${token}`)
      .send({ url: helper.vaildUrl })
      .expect(201)
      .expect('Content-Type', /application\/json/);
    const allUrls = await Url.find({});
    const originUrls = allUrls.map((r) => r.originUrl);

    expect(allUrls).toHaveLength(helper.initialUrls.length + 1);
    expect(originUrls).toContain(helper.vaildUrl);
  });

  test('returns a 400 status with invalid input', async () => {
    await api
      .post('/api/url')
      .set('Authorization', `bearer ${token}`)
      .send({ url: helper.invaildUrl })
      .expect(400);

    const allUrls = await Url.find({});
    expect(allUrls).toHaveLength(helper.initialUrls.length);
  });

  test('adding a new url with valid input but no token provided is okay', async () => {
    await api.post('/api/url').send({ url: helper.vaildUrl }).expect(201);

    const allUrls = await Url.find({});
    expect(allUrls).toHaveLength(helper.initialUrls.length + 1);
  });

  test('add a new url with duplicate short url should return error', async () => {
    const allUrls = await Url.find({});
    await api
      .post('/api/url')
      .set('Authorization', `bearer ${token}`)
      .send({ url: allUrls[0].originUrl, customShortUrl: allUrls[0].shortUrl })
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });

  test('add a new url with custom short url should return ok', async () => {
    const customShortUrl = '213qweasd';
    await api
      .post('/api/url')
      .set('Authorization', `bearer ${token}`)
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
    await api
      .delete(`/api/url/${urlToDelete.shortUrl}`)
      .set('Authorization', `bearer ${token}`)
      .expect(204);
    const urlAtEnd = await helper.urlsInDb();
    expect(urlAtEnd).toHaveLength(helper.initialUrls.length - 1);

    const existShortUrl = urlAtEnd.map((url) => url.shortUrl);
    expect(existShortUrl).not.toContain(urlToDelete.shortUrl);
  });
  test("User can't delete another user create url", async () => {
    const urlAtStart = await helper.urlsInDb();
    const urlToDelete = urlAtStart[0];
    await api
      .delete(`/api/url/${urlToDelete.shortUrl}`)
      .set('Authorization', `bearer ${token2}`)
      .expect(403);
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
      .set('Authorization', `bearer ${token}`)
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
      .set('Authorization', `bearer ${token}`)
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
      .set('Authorization', `bearer ${token}`)
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
      .set('Authorization', `bearer ${token}`)
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
      .set('Authorization', `bearer ${token}`)
      .expect(409);
  });

  test('update same short url but different title', async () => {
    const urlAtStart = await helper.urlsInDb();
    const urlToUpdate = urlAtStart[0];
    const updateTitle = 'sadewq';
    await api
      .patch(`/api/url/${urlToUpdate.shortUrl}`)
      .send({ newShortUrl: urlToUpdate.shortUrl, newTitle: updateTitle })
      .set('Authorization', `bearer ${token}`)
      .expect(200);
    const urlAtEnd = await helper.urlsInDb();
    expect(urlAtEnd).toHaveLength(helper.initialUrls.length);

    expect(urlAtEnd[0].shortUrl).toBe(urlAtStart[0].shortUrl);
    expect(urlAtEnd[0].title).toBe(updateTitle);
  });
});
