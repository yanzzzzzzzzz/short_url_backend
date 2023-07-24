const UrlRouter = require("express").Router();
const Url = require("../models/url");
const User = require("../models/user");

const characters =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function generateRandomString() {
  let result = "";
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

UrlRouter.post("/", async (req, res) => {
  const body = req.body;
  const url = body.url;
  const user = req.user;
  if (!isValidUrl(url)) {
    res.status(400).json({ error: "url is invalid" }).end();
  } else {
    let randomString = await generateUniqueRandomString();

    const shortUrl = `${randomString}`;
    const urlModel = new Url({
      originUrl: url,
      shortUrl: shortUrl,
      user: user?._id,
    });
    const savedUrl = await urlModel.save();
    if (savedUrl != null && user != null) {
      user.urls = user.urls.concat(savedUrl._id);
      await user.save();
    }

    res.status(201).json(savedUrl);
  }
});

UrlRouter.get("/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;
  const url = await Url.findOne({ shortUrl });
  if (url) {
    res.redirect(url.originUrl);
  } else {
    res.status(404).end();
  }
});

UrlRouter.get("/", async (req, res) => {
  const urls = await Url.find({}).populate("user", { username: 1, name: 1 });
  return res.json(urls);
});

UrlRouter.delete("/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;
  const url = await Url.findOne({ shortUrl: shortUrl });
  if (url) {
    await Url.findByIdAndDelete(url._id);
    res.status(204).end();
  } else {
    res.status(404).end();
  }
});

UrlRouter.put("/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;
  const { originUrl } = req.body;
  const url = await Url.findOne({ shortUrl: shortUrl });
  if (url) {
    await Url.findByIdAndUpdate(url._id, {
      originUrl: originUrl,
      shortUrl: url.shortUrl,
    });
    res.status(200).end();
  } else {
    res.status(404).end();
  }
});

UrlRouter.patch("/:shortUrl", async (req, res) => {
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
