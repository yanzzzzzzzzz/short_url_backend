const bcrypt = require('bcryptjs');
const supertest = require('supertest');
const User = require('../models/user');
const Url = require('../models/url');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);
const redisClient = require('../Service/RedisService');
const mongoose = require('mongoose');

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
      password: 'test7777'
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
    expect(result.body.error).toContain("password can't be null");
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

  test('creation fails with proper status code and message if email already exist', async () => {
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

describe('PATCH', () => {
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

  afterEach(async () => {
    await User.deleteMany({});
  });

  test('update user email', async () => {
    const usersAtStart = await helper.usersInDb();
    const testUser = helper.initialUsers[0];
    const newEmail = 'newMail@com.tw';

    const loginResponse = await api
      .post('/api/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);
    const cookie = loginResponse.headers['set-cookie'];
    await api.patch('/api/users').set('Cookie', cookie).send({ email: newEmail }).expect(204);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd[0].email).toEqual(newEmail);
  });

  test('update username', async () => {
    const testUser = helper.initialUsers[0];
    const newName = 'newName';

    const loginResponse = await api
      .post('/api/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);
    const cookie = loginResponse.headers['set-cookie'];
    await api.patch('/api/users').set('Cookie', cookie).send({ username: newName }).expect(204);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd[0].username).toEqual(newName);
  });

  test('update username and email', async () => {
    const testUser = helper.initialUsers[0];
    const newInfo = { email: 'newEmail', username: 'newUserName' };

    const loginResponse = await api
      .post('/api/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);
    const cookie = loginResponse.headers['set-cookie'];
    await api.patch('/api/users').set('Cookie', cookie).send(newInfo).expect(204);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd[0].username).toEqual(newInfo.username);
    expect(usersAtEnd[0].email).toEqual(newInfo.email);
  });
});

describe('DELETE', () => {
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

  afterEach(async () => {
    await User.deleteMany({});
  });
  test('normal delete', async () => {
    const testUser = helper.initialUsers[0];
    const loginResponse = await api
      .post('/api/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    const cookie = loginResponse.headers['set-cookie'];
    await api.delete('/api/users').set('Cookie', cookie).expect(204);
    const deletedUser = await User.findOne({ email: testUser.email });
    expect(deletedUser).toBeNull();
  });
  test('not login and delete will error', async () => {
    await api.delete('/api/users').expect(401);
  });
});

afterAll(async () => {
  await redisClient.disconnect();
  await mongoose.connection.close();
});
