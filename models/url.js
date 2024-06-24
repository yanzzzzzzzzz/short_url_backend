const mongoose = require('mongoose');
const urlSchema = new mongoose.Schema({
  createTime: {
    type: Date,
    default: Date.now
  },
  updateTime: {
    type: Date
  },
  expiredTime: {
    type: Date
  },
  title: {
    type: String
  },
  previewImage: {
    type: String
  },
  originUrl: {
    type: String,
    required: true
  },
  shortUrl: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

urlSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

function addOneHour(date) {
  return new Date(date.getTime() + 60 * 60 * 1000);
}

urlSchema.pre('save', function (next) {
  const date = new Date();
  this.updateTime = date;
  if (!this.expiredTime) {
    this.expiredTime = addOneHour(date);
  }
  next();
});

module.exports = mongoose.model('Url', urlSchema);
