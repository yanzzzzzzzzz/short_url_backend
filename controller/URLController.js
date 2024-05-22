const UrlRouter = require('express').Router();
const Url = require('../models/url');
const User = require('../models/user');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const redisClient = require('../Service/RedisService');

function generateRandomString() {
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
async function generateUniqueRandomString() {
  let randomString = generateRandomString();
  let existingUrl = await Url.findOne({ shortUrl: randomString });
  while (existingUrl) {
    randomString = generateRandomString();
    existingUrl = await Url.findOne({ shortUrl: randomString });
  }
  return randomString;
}
async function getUrlInformation(url) {
  try {
    const response = await fetch(url);
    const htmlContent = await response.text();
    const $ = cheerio.load(htmlContent);
    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content');
    const previewImage = $('meta[property="og:image"]').attr('content');

    return { title, description, previewImage };
  } catch (error) {
    console.error(error);
  }
}

function isValidUrl(string) {
  try {
    new URL(string);
  } catch (_) {
    return false;
  }
  return true;
}

UrlRouter.post('/', async (req, res) => {
  const originUrl = req.body.url;
  const user = req.user;
  if (originUrl === undefined || !isValidUrl(originUrl)) {
    res.status(400).json({ error: 'url is invalid' }).end();
    return;
  }
  const customShortUrl = req.body.customShortUrl;
  let shortUrl;
  if (customShortUrl === undefined || customShortUrl === '') {
    shortUrl = await generateUniqueRandomString();
  } else {
    shortUrl = customShortUrl;
    let existingUrl = await Url.findOne({ shortUrl });
    if (existingUrl !== null) {
      return res.status(400).json({ error: 'Duplicate short URL exists.' }).end();
    }
  }

  const urlInfo = await getUrlInformation(originUrl);
  const datenow = new Date();
  const urlObj = {
    createTime: datenow.toISOString().replace('T', ' ').substring(0, 19),
    title: urlInfo.title,
    previewImage: urlInfo.previewImage,
    originUrl,
    shortUrl
  };
  const urlModel = new Url({ ...urlObj, user: user?._id });
  const savedUrl = await urlModel.save();
  await redisClient.set(shortUrl, originUrl, 'EX', 60 * 60);
  if (savedUrl != null && user != null) {
    user.urls = user.urls.concat(savedUrl._id);
    await user.save();
  }

  res.status(201).json(urlObj);
});

UrlRouter.get('/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;
  const originalUrlOnRedis = await redisClient.get(shortUrl);
  if (originalUrlOnRedis !== null) {
    return res.redirect(originalUrlOnRedis);
  }
  const url = await Url.findOne({ shortUrl });
  if (url) {
    redisClient.set(url.shortUrl, url.originUrl, 'EX', 60 * 60);
    return res.redirect(url.originUrl);
  } else {
    res.status(400).end();
  }
});

UrlRouter.get('/', async (req, res) => {
  const user = req.user;
  if (user == null) {
    return res.json([]);
  }
  const page = req.query.page ? parseInt(req.query.page) : 0;
  const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 1000;

  const skip = page > 0 ? page * pageSize : 0;
  const searchKeyword = req.query.searchKeyword;
  let match = {};

  if (searchKeyword) {
    match = { title: { $regex: searchKeyword, $options: 'i' } };
  }
  const urlList = await User.findOne({ email: user.email }).populate({
    path: 'urls',
    select: 'originUrl shortUrl createTime previewImage title',
    match: match,
    options: { sort: { createTime: -1 }, skip: skip, limit: pageSize }
  });
  const userCount = await User.findOne({ email: user.email }).populate({
    path: 'urls',
    match: match
  });
  const pageCount = Math.ceil(userCount.urls.length / pageSize);
  const hasNext = page < pageCount;
  const sanitizedUrlList = urlList.urls.map((url) => ({
    originUrl: url.originUrl,
    shortUrl: url.shortUrl,
    createTime: url.createTime,
    previewImage: url.previewImage,
    title: url.title
  }));
  return res.json({
    content: sanitizedUrlList,
    pagination: {
      page: page,
      size: pageSize,
      hasNext: hasNext,
      pageCount: pageCount
    }
  });
});

UrlRouter.delete('/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;
  const url = await Url.findOne({ shortUrl: shortUrl });

  if (url) {
    if (url.user != null && req.user._id.toString() !== url.user._id.toString()) {
      return res
        .status(403)
        .json({ error: 'Unauthorized: Cannot delete URL created by another user' })
        .end();
    }
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { urls: url._id }
      });
    }
    await Url.findByIdAndDelete(url._id);
    res.status(204).end();
  } else {
    res.status(404).end();
  }
});

UrlRouter.put('/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;
  const body = req.body;
  const url = await Url.findOne({ shortUrl: shortUrl });
  if (url) {
    if (req.user._id.toString() !== url.user._id.toString()) {
      res
        .status(403)
        .json({ error: 'Unauthorized: Cannot modify URL created by another user' })
        .end();
    }
    await Url.findByIdAndUpdate(url._id, {
      originUrl: body.originUrl,
      shortUrl: body.shortUrl
    });
    res.status(200).end();
  } else {
    res.status(404).end();
  }
});

UrlRouter.patch('/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;
  const { newShortUrl, newTitle } = req.body;
  const url = await Url.findOne({ shortUrl: shortUrl });
  if (!url) {
    return res.status(404).end();
  }
  if (newShortUrl !== undefined && newShortUrl !== shortUrl) {
    const existingUrl = await Url.findOne({ shortUrl: newShortUrl });
    if (existingUrl) {
      return res.status(409).end();
    }
    url.shortUrl = newShortUrl;
  }
  if ((newTitle !== null) | (newTitle !== undefined)) {
    url.title = newTitle;
  }
  await url.save();
  return res.status(200).json(url).end();
});

module.exports = UrlRouter;
