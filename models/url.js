const mongoose = require("mongoose");
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
