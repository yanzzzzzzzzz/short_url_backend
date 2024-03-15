const Url = require('../models/url');
const User = require('../models/user');
const initialUrls = [
  {
    originUrl: 'https://disp.cc/b/',
    shortUrl: 'AAAAAA'
  },
  {
    originUrl: 'https://github.com/yanzzzzzzzzz',
    shortUrl: 'yanzzzzzzzzz'
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
    name: 'Matti Luukkainen',
    password: 'salainen'
  },
  {
    username: 'root',
    name: 'root123',
    password: '1234'
  },
  {
    username: 'ggallin',
    name: 'ggallin',
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
