const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;

const collection = new Schema({
    _id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    // 收藏夹名
    title: {
        type: String,
        required: true
    },
    // 收藏夹API
    url: String,
    // 回答数
    answerCount: Number,
    // 更新时间
    updateTime: Number,
    // 关注人数
    followerCount: Number,
    // 是否公共
    isPublic: Boolean,
    // 收藏夹ID
    id: String,
    find_by_user: String,
    // 更新时间
    updatedAt: {
        type: Number,
        default: parseInt(new Date().getTime() / 1000)
    }
});

module.exports = mongoose.model('Collections',collection);