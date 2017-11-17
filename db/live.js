const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;

const live = new Schema({
    _id:{
        type: String,
        required: true,
        unique: true,
        index:true
    },
    // live名
    subject: {
        type: String,
        required: true
    },
    // 评分
    score: Number,
    // 主讲人
    speaker: Object,
    // live标签
    tags: Array,
    // 价格
    fee: Number,
    //
    id: String,
    // 评论数
    reviewCount: Number,
    // 参与人数
    seats: Number,
    // live状态
    status: String,
    // 更新时间
    updatedAt: {
        type: Number,
        default: parseInt(new Date().getTime() / 1000)
    }
});

module.exports = mongoose.model('Lives',live);