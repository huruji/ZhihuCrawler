const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;

const column = new Schema({
    // 专栏名
    title: {
        type: String,
        required: true
    },
    // 专栏介绍
    intro: {
        type: String
    },
    // 专栏图片
    imageUrl: {
        type: String
    },
    // 专栏ID
    id: {
        type: String
    },
    // 关注人数
    followers: {
        type: Number
    },
    // 文章数量
    articlesCount: {
        type: Number
    },
    // 允许评论
    commentPermission: {
        type: String
    },
    // API的URL
    url: {
        type: String
    },
    // 专栏作者
    author: {
        type: Object
    },
    // 更新时间
    updated: {
        type: String
    },
    //
    find_by_user: {
        type: String
    },
    create_time: Date,

});

module.exports = mongoose.model('Columns',column);