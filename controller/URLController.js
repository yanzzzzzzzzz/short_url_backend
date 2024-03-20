const UrlRouter = require('express').Router();
const Url = require('../models/url');
const User = require('../models/user');

const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

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

  const shortUrl = await generateUniqueRandomString();

  const urlModel = new Url({
    originUrl,
    shortUrl,
    user: user?._id
  });
  const savedUrl = await urlModel.save();
  if (savedUrl != null && user != null) {
    user.urls = user.urls.concat(savedUrl._id);
    await user.save();
  }

  res.status(201).json({ originUrl, shortUrl });
});

UrlRouter.get('/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;
  const url = await Url.findOne({ shortUrl });
  if (url) {
    res.redirect(url.originUrl);
  } else {
    res.status(400).end();
  }
});

UrlRouter.get('/', async (req, res) => {
  const user = req.user;
  if (user == null) {
    return res.json([]);
  }
  const urlList = await User.findOne({ username: user.username }).populate(
    'urls',
    'originUrl shortUrl'
  );
  const sanitizedUrlList = urlList.urls.map((url) => ({
    originUrl: url.originUrl,
    shortUrl: url.shortUrl
  }));
  return res.json(sanitizedUrlList);
});

UrlRouter.delete('/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;
  const url = await Url.findOne({ shortUrl: shortUrl });
  if (url) {
    if (req.user._id.toString() !== url.user._id.toString()) {
      res
        .status(403)
        .json({ error: 'Unauthorized: Cannot delete URL created by another user' })
        .end();
    }
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { urls: url._id }
    });
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
  const { newShortUrl } = req.body;
  const url = await Url.findOne({ shortUrl: shortUrl });
  if (!url) {
    return res.status(404).end();
  }
  if (url.shortUrl === newShortUrl) {
    return res.status(200).end();
  }
  const existingUrl = await Url.findOne({ shortUrl: newShortUrl });
  if (existingUrl) {
    return res.status(409).end();
  }

  url.shortUrl = newShortUrl;
  await url.save();
  return res.status(200).end();
});

module.exports = UrlRouter;
