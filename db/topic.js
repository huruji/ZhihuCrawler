const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;

const topic = new Schema({
    // 话题名
    name: {
        type: String,
        index: true,
        required: true
    },
    // 话题图片
    avatarUrl: {
        type: String
    },
    // 话题介绍
    introduction: {
        type: String
    },
    // 话题api的url
    url: {
        type: String
    },
    // 话题摘记
    excerpt: {
        type: String
    },
    // 话题ID
    topicId: {
        type: String
    },
    // 话题关注者人数
    followers: {
        type: Number
    },
    // 话题的跳转者
    find_by_user: {
        type: String
    }
});

module.exports = mongoose.model('Topics',topic);