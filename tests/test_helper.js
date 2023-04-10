const Url = require("../models/url");

const initialUrls = [
  {
    originUrl: "https://chat.openai.com/chat",
    shortUrl: "AAAAAA",
  },
  {
    originUrl: "https://github.com/yanzzzzzzzzz",
    shortUrl: "yanzzzzzzzzz",
  },
];
const vaildUrl = "https://www.google.com.tw/";
const invaildUrl = "asd.tw";
const urlsInDb = async () => {
  const urls = await Url.find({});
  return urls.map((url) => url.toJSON());
};
module.exports = {
  initialUrls,
  vaildUrl,
  invaildUrl,
  urlsInDb,
};
