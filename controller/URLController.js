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

UrlRouter.post("/", (req, res) => {
  const { url } = req.body;
  const randomString = generateRandomString();
  const shortUrl = `${randomString}`;
  const urlModel = new Url({
    originUrl: url,
    shortUrl: shortUrl,
  });
  urlModel
    .save()
    .then((savedUrl) => {
      res.json(savedUrl);
    })
    .catch((error) => {
      console.log("error", error);
      res.status(404).json({ error: error });
    });
});

UrlRouter.get("/:shortUrl", (req, res) => {
  const { shortUrl } = req.params;
  if (shortUrl) {
    console.log("shortUrl", shortUrl);
    Url.findOne({ shortUrl }).then((url) => {
      if (url) {
        res.redirect(url.originUrl);
      } else {
        res.status(404).json({ error: "URL not found" });
      }
    });
  }
});

UrlRouter.get("/", (req, res) => {
  Url.find({}).then((result) => {
    return res.json(result);
  });
});

module.exports = UrlRouter;
