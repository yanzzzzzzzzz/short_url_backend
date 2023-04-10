const UrlRouter = require("express").Router();
const Url = require("../models/url");

const characters =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function generateRandomString() {
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function isValidUrl(string) {
  try {
    new URL(string);
  } catch (_) {
    return false;
  }
  return true;
}

UrlRouter.post("/", async (req, res, next) => {
  const { url } = req.body;
  if (!isValidUrl(url)) {
    res.status(400).json({ error: "url is invalid" }).end();
  } else {
    const randomString = generateRandomString();
    const shortUrl = `${randomString}`;
    const urlModel = new Url({
      originUrl: url,
      shortUrl: shortUrl,
    });
    await urlModel.save();
    res.status(201).json(urlModel);
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
  const urls = await Url.find({});
  return res.json(urls);
});

module.exports = UrlRouter;
