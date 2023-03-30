const mongoose = require("mongoose");

const connectString = `mongodb+srv://fullstack:1234@cluster0.pm9okyd.mongodb.net/URLShortenerDB?retryWrites=true&w=majority`;

mongoose
  .connect(connectString)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const urlSchema = new mongoose.Schema({
  originUrl: String,
  shortUrl: String,
});

urlSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Url", urlSchema);
