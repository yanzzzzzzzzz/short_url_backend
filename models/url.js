const mongoose = require('mongoose');
const urlSchema = new mongoose.Schema({
  createTime: {
    type: Date,
    default: Date.now
  },
  updateTime: {
    type: Date,
    default: Date.now
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

function formatDate(date) {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

function addOneHour(date) {
  return new Date(date.getTime() + 60 * 60 * 1000);
}

urlSchema.pre('save', function (next) {
  const now = new Date();
  this.updateTime = formatDate(now);

  if (!this.createTime) {
    this.createTime = formatDate(now);
  }

  if (!this.expiredTime) {
    this.expiredTime = formatDate(addOneHour(now));
  }
  next();
});

module.exports = mongoose.model('Url', urlSchema);
