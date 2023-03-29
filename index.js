const express = require("express");
const cors = require("cors");
const logger = require("./utils/logger");
const config = require("./utils/config");
const app = express();

app.use(cors());
app.use(express.json());
const PORT = config.PORT;
let urls = [
  {
    originUrl: "https://chat.openai.com/chat",
    shortUrl: "AAAAAA",
  },
];
function generateRandomString() {
  const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
app.post("/shorten", (req, res) => {
  const { url } = req.body;
  const randomString = generateRandomString();
  const shortUrl = `${randomString}`;

  urls = urls.concat({ originUrl: url, shortUrl: shortUrl });

  res.json({ shortUrl });
});

app.get("/:id", (req, res) => {
  const { id } = req.params;
  const url = urls.find((url) => url.shortUrl === id);
  if (url) {
    res.redirect(url.originUrl);
  } else {
    res.status(404).json({ error: "URL not found" });
  }
});

app.get("/", (req, res) => {
  return res.json({ urls });
});

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT} http://localhost:${PORT}/`);
});
