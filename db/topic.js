const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;

const topic = new Schema({
    _id:{
        type: String,
        required: true,
        unique: true,
        index:true
    },
    // 话题名
    name: {
        type: String,
        required: true
    },
    // 话题图片
    avatarUrl: String,
    // 话题介绍
    introduction: String,
    // 话题api的url
    url: String,
    // 话题摘记
    excerpt: String,
    // 话题ID
    topicId: String,
    // 话题关注者人数
    followers: Number,
    // 话题的跳转者
    find_by_user: String,
    // 更新时间
    updatedAt: {
        type: Number,
        default: parseInt(new Date().getTime() / 1000)
    }
});

module.exports = mongoose.model('Topics',topic);