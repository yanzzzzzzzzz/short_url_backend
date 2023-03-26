const express = require("express");

const app = express();

app.use(express.json());
const PORT = 4001;
const urls = {};
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
  const shortUrl = `http://localhost:${PORT}/${randomString}`;

  urls[randomString] = url;

  res.json({ shortUrl });
});

app.get("/:id", (req, res) => {
  const { id } = req.params;
  const url = urls[id];

  if (url) {
    res.redirect(url);
  } else {
    res.status(404).json({ error: "URL not found" });
  }
});

app.get("/", (req, res) => {
  res.send("Hi");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} http://localhost:${PORT}/`);
});
