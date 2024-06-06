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

afterAll(async () => {
  await redisClient.disconnect();
  await mongoose.connection.close();
});
