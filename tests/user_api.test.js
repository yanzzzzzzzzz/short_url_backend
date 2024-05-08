const bcrypt = require('bcrypt');
const supertest = require('supertest');
const User = require('../models/user');
const Url = require('../models/url');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);
describe('POST /api/users', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    for (let index = 0; index < helper.initialUsers.length; index++) {
      const initialUser = helper.initialUsers[index];
      const passwordHash = await bcrypt.hash(initialUser.password, 10);
      const user = new User({
        username: initialUser.username,
        email: initialUser.email,
        passwordHash
      });
      await user.save();
    }
  });

  test('creation succeeds with a new username', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'test777',
      email: 'test777@yahoo.com.tw',
      password: 'test777'
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  }, 500000);

  test('creation invalid user that username length <3', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'ml',
      email: 'Matti@gadg.com',
      password: 'salainen'
    };

    await api.post('/api/users').send(newUser).expect(400);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test('creation invalid user that password is null', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'ml123',
      email: 'Matti@gadg.com',
      password: ''
    };

    const result = await api.post('/api/users').send(newUser).expect(400);
    expect(result.body.error).toContain('password can not be null');
    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test('creation invalid user that mail is null', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'ml123',
      email: '',
      password: 'ml123'
    };

    const result = await api.post('/api/users').send(newUser).expect(400);
    expect(result.body.error).toContain('email is invalid');
    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test('creation fails with proper statuscode and message if email already exist', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'root',
      email: usersAtStart[0].email,
      password: 'root123'
    };
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('This email is already registered');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toEqual(usersAtStart);
  }, 50000);
});

describe('GET /api/users', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    for (let initialUser of helper.initialUsers) {
      const passwordHash = await bcrypt.hash(initialUser.password, 10);
      const user = new User({
        username: initialUser.username,
        email: initialUser.email,
        passwordHash
      });
      await user.save();
    }
    const testUser = await User.findOne({ username: helper.initialUsers[0].username });
    for (let index = 0; index < helper.initialUrls.length; index++) {
      const urlData = helper.initialUrls[index];
      const urlModel = new Url({
        originUrl: urlData.originUrl,
        shortUrl: urlData.shortUrl,
        user: testUser._id
      });
      const savedUrl = await urlModel.save();
      testUser.urls = testUser.urls.concat(savedUrl._id);
      await testUser.save();
    }
  });
  test('get all user', async () => {
    const response = await api.get('/api/users');
    expect(response.body).toHaveLength(helper.initialUsers.length);
  });
  test('should retrieve short URLs created by a specific user', async () => {
    const existingUser = helper.initialUsers[0];

    const response = await api
      .get(`/api/users/${existingUser.username}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);
    expect(response.body.urls).toHaveLength(helper.initialUrls.length);
  });
});
