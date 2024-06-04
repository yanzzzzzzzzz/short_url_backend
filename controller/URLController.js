const Url = require('../models/url');
const User = require('../models/user');
const { generateRandomString } = require('../utils/randomString');
const redisClient = require('../Service/RedisService');
const { getUrlInfo, isValidUrl } = require('../utils/url');

async function generateUniqueRandomString() {
  let randomString;
  let existingUrl;
  do {
    randomString = generateRandomString();
    existingUrl = await Url.findOne({ shortUrl: randomString });
  } while (existingUrl);
  return randomString;
}

exports.createShortUrl = async (req, res) => {
  const originUrl = req.body.url;
  const user = req.user;
  if (!originUrl || !isValidUrl(originUrl)) {
    return res.status(400).json({ error: 'Invalid input URL format' });
  }
  const customShortUrl = req.body.customShortUrl;
  let shortUrl;
  if (!customShortUrl) {
    shortUrl = await generateUniqueRandomString();
  } else {
    shortUrl = customShortUrl;
    const existingUrl = await Url.findOne({ shortUrl });
    if (existingUrl) {
      return res.status(409).json({ error: 'Duplicate short URL exists' });
    }
  }

  const urlInfo = await getUrlInfo(originUrl);
  const urlObj = {
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    title: urlInfo.title,
    previewImage: urlInfo.previewImage,
    originUrl,
    shortUrl,
    user: user?._id
  };
  const urlModel = new Url(urlObj);
  const savedUrl = await urlModel.save();
  await redisClient.set(shortUrl, originUrl, 'EX', 60 * 60);
  if (user) {
    user.urls.push(savedUrl._id);
    await user.save();
  }

  res.status(201).json(urlObj);
};

exports.redirectShortUrl = async (req, res) => {
  const { shortUrl } = req.params;
  const originalUrlOnRedis = await redisClient.get(shortUrl);
  if (originalUrlOnRedis) {
    console.log('load url on redis');
    return res.redirect(originalUrlOnRedis);
  }
  const url = await Url.findOne({ shortUrl });
  if (url) {
    await redisClient.set(url.shortUrl, url.originUrl, 'EX', 60 * 60);
    return res.redirect(url.originUrl);
  } else {
    res.status(404).end();
  }
};

exports.getUserUrls = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.json([]);
  }
  const page = req.query.page ? parseInt(req.query.page) : 0;
  const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 1000;

  const skip = page > 0 ? page * pageSize : 0;
  const searchKeyword = req.query.searchKeyword;
  const match = searchKeyword ? { title: { $regex: searchKeyword, $options: 'i' } } : {};

  const urlList = await User.findOne({ email: user.email }).populate({
    path: 'urls',
    match,
    options: { sort: { createTime: -1 }, skip, limit: pageSize }
  });
  const userCount = await User.findOne({ email: user.email }).populate({
    path: 'urls',
    match
  });
  const pageCount = Math.ceil(userCount.urls.length / pageSize);
  const hasNext = page < pageCount;

  res.json({
    content: urlList.urls,
    pagination: {
      page,
      size: pageSize,
      hasNext,
      pageCount
    }
  });
};

exports.deleteShortUrl = async (req, res) => {
  const { shortUrl } = req.params;
  const url = await Url.findOne({ shortUrl });
  if (!url) {
    return res.status(404).json({ error: 'URL not found' });
  }
  if (!url.user) {
    return res.status(401).json({
      error:
        'This URL was created by a guest or an unauthenticated user. Please create account/log in to perform more actions'
    });
  }
  if (req.user._id.toString() !== url.user._id.toString()) {
    return res.status(403).json({ error: 'Unauthorized: Cannot delete URL by another user' });
  }
  await Url.findByIdAndDelete(url._id);
  const checkUrlOnRedis = await redisClient.get(url.shortUrl);
  if (checkUrlOnRedis) {
    await redisClient.del(url.shortUrl);
  }
  res.status(204).end();
};

exports.updateShortUrl = async (req, res) => {
  const { shortUrl } = req.params;
  const body = req.body;
  const url = await Url.findOne({ shortUrl });
  if (url) {
    if (req.user._id.toString() !== url.user._id.toString()) {
      return res
        .status(403)
        .json({ error: 'Unauthorized: Cannot modify URL created by another user' });
    }
    await Url.findByIdAndUpdate(url._id, {
      originUrl: body.originUrl,
      shortUrl: body.shortUrl
    });
    res.status(200).end();
  } else {
    res.status(404).end();
  }
};

exports.patchShortUrl = async (req, res) => {
  const { shortUrl } = req.params;
  const { newShortUrl, newTitle } = req.body;
  const url = await Url.findOne({ shortUrl });
  if (!url) {
    return res.status(404).end();
  }
  if (newShortUrl && newShortUrl !== shortUrl) {
    const existingUrl = await Url.findOne({ shortUrl: newShortUrl });
    if (existingUrl) {
      return res.status(409).end();
    }
    url.shortUrl = newShortUrl;
  }
  if (newTitle !== null && newTitle !== undefined) {
    url.title = newTitle;
  }
  await url.save();
  res.status(200).json(url).end();
};
