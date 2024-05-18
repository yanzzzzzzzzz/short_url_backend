const Url = require('../models/url');
const User = require('../models/user');
const initialUrls = [
  {
    originUrl: 'https://disp.cc/b/',
    shortUrl: 'AAAAAA',
    title: 'this is ptt'
  },
  {
    originUrl: 'https://github.com/yanzzzzzzzzz',
    shortUrl: 'yanzzzzzzzzz',
    title: 'this is myblog'
  },
  {
    originUrl: 'https://www.npmjs.com/package/mongoose-paginate-v2',
    shortUrl: 'AABB',
    title: 'mongoose-paginate'
  },
  {
    originUrl: 'https://github.com/yanzzzzzzzzz/short_url_frontend/issues',
    shortUrl: 'shorturl',
    title: 'shorturl'
  },
  {
    originUrl: 'https://primevue.org/paginator/',
    shortUrl: 'paginator',
    title: 'paginator'
  }
];
const vaildUrl = 'https://www.google.com.tw/';
const invaildUrl = 'asd.tw';
const updateShortUrl = 'ABCDEFG';
const urlsInDb = async () => {
  const urls = await Url.find({});
  return urls.map((url) => url.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

const initialUsers = [
  {
    username: 'mluukkai',
    email: 'mluukkai@example.com',
    password: 'salainen'
  },
  {
    username: 'root',
    email: 'root@example.com',
    password: '1234'
  },
  {
    username: 'ggallin',
    email: 'gg@example.com',
    password: 'ggallin1234'
  }
];
module.exports = {
  initialUrls,
  vaildUrl,
  invaildUrl,
  updateShortUrl,
  initialUsers,
  urlsInDb,
  usersInDb
};
