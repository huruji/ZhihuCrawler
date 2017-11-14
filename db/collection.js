const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;

const collection = new Schema({
    // 收藏夹名
    title: {
        type: String,
        required: true
    },
    // 收藏夹API
    url: {
        type: String,
    },
    // 回答数
    answerCount: {
        type: Number
    },
    // 更新时间
    updateTime: {
        type: Number
    },
    // 关注人数
    followerCount: {
        type: Number
    },
    // 是否公共
    isPublic: {
        type: Boolean
    },
    // 收藏夹ID
    id: {
        type: String
    },
    find_by_user: {
        type: String
    },
    create_time: Date,
});

module.exports = mongoose.model('Collections',collection);