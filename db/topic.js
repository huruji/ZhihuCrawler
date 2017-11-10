const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;

const topic = new Schema({
    name: {
        type: String,
        index: true,
        required: true
    },
    avatarUrl: {
        type: String
    },
    introduction: {
        type: String
    },
    url: {
        type: String
    },
    excerpt: {
        type: String
    },
    topicId: {
        type: String
    },
    followers: {
        type: Number
    },
    find_by_user: {
        type: String
    },
    create_time: Date,
});

module.exports = mongoose.model('Topics',topic);