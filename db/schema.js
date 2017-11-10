const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;

const UserSchema = new Schema({
  name: {
    type: String,
    index: true,
    require: true,
  },
  token: {
    type: String,
    require:true
  },
  signature: {
    type: String,
  },
  sex: {
    type: String,
  },
  following: {
    type: Array,
    default: []
  },
  followers: {
    type: Array,
    default: []
  },
  avatar: {
    type: String
  },
  create_time: Date
});

module.exports = mongoose.model('User', UserSchema);
