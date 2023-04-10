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

module.exports = {
  initialUrls,
  vaildUrl,
  invaildUrl,
};
