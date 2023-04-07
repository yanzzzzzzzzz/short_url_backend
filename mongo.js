const config = require("./utils/config");
const mongoose = require("mongoose");

mongoose.connect(config.MONGODB_URI);

const urlSchema = new mongoose.Schema({
  originUrl: String,
  shortUrl: String,
});

const Url = mongoose.model("Url", urlSchema);

Url.find({}).then((result) => {
  result.forEach((u) => {
    console.log(u);
  });
  mongoose.connection.close();
});
