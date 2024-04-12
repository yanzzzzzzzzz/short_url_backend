const supertest = require('supertest');
const User = require('../models/user');
const Url = require('../models/url');
const helper = require('./test_helper');
const bcrypt = require('bcrypt');
const app = require('../app');
const api = supertest(app);

let testUser;

describe('login api', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Url.deleteMany({});
    testUser = helper.initialUsers[0];
    const passwordHash = await bcrypt.hash(testUser.password, 10);
    const user = new User({
      username: testUser.username,
      name: testUser.name,
      passwordHash
    });
    await user.save();
  }, 50000);

  test('correct password return login success', async () => {
    await api
      .post('/api/login')
      .send({ username: testUser.username, password: testUser.password })
      .expect(200);
  }, 50000);

  test('error password return login failed', async () => {
    await api
      .post('/api/login')
      .send({ username: testUser.username, password: `${testUser.password}123` })
      .expect(401);
  }, 50000);
});
