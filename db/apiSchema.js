const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;

const UserSchema = new Schema({
  name: {
    type: String,
    index: true,
  },
  avatar_url: {
    type: String
  },
  avatar_url_template: {
    type: String
  },
  badge: {
    type: Array
  },
  gender: {
    type: Number
  },
  headline: {
    type: String
  },
  id: {
    type: String
  },
  is_advertiser: {
    type: Boolean
  },
  is_org: {
    type: Boolean
  },
  type: {
    type: String
  },
  url: {
    type:String
  },
  url_token: {
    type: String
  },
  user_type: {
    type: String
  },
  following: {
    type: Number
  },
  followers: {
    type: Number
  }
});

module.exports = mongoose.model('User', UserSchema);
