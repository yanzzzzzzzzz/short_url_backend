const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log(
    "Please provide the password as an argument: node mongo.js <password>"
  );
  process.exit(1);
}

const pd = process.argv[2];

const connectDBUrl = `mongodb+srv://fullstack:${pd}@cluster0.pm9okyd.mongodb.net/URLShortenerDB?retryWrites=true&w=majority`;
mongoose.connect(connectDBUrl);

const urlSchema = new mongoose.Schema({
  originUrl: String,
  shortUrl: String,
});

const Url = mongoose.model("Url", urlSchema);

const url = new Url({
  originUrl: "https://chat.openai.com/chat",
  shortUrl: "AAAAAA",
});

// url.save().then((res) => {
//   console.log("url save!");
//   mongoose.connection.close();
// });

Url.find({}).then((result) => {
  result.forEach((u) => {
    console.log(u);
  });
  mongoose.connection.close();
});
