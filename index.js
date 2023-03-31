const express = require("express");
const cors = require("cors");
const logger = require("./utils/logger");
const config = require("./utils/config");
const app = express();
const Url = require("./models/url");
const { response } = require("express");

app.use(cors());
app.use(express.json());
const PORT = config.PORT;

const characters =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
let urls = [
  {
    originUrl: "https://chat.openai.com/chat",
    shortUrl: "AAAAAA",
  },
];
function generateRandomString() {
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
app.post("/", (req, res) => {
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
  // urls = urls.concat({ originUrl: url, shortUrl: shortUrl });

  // res.json({ shortUrl });
});

app.get("/:shortUrl", (req, res) => {
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

app.get("/", (req, res) => {
  Url.find({}).then((result) => {
    return res.json({ result });
  });
});

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT} http://localhost:${PORT}/`);
});
