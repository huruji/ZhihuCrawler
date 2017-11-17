const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;

const column = new Schema({
    _id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    // 专栏名
    title: {
        type: String,
        required: true
    },
    // 专栏介绍
    intro: String,
    // 专栏图片
    imageUrl: String,
    // 专栏ID
    id: String,
    // 关注人数
    followers: Number,
    // 文章数量
    articlesCount: Number,
    // 允许评论
    commentPermission: String,
    // API的URL
    url: String,
    // 专栏作者
    author: Object,
    // 更新时间
    updated: Number,
    // 从哪个用户获取的
    find_by_user: String,
    // 更新时间
    updatedAt: {
        type: Number,
        default: parseInt(new Date().getTime() / 1000)
    }
});

module.exports = mongoose.model('Columns',column);