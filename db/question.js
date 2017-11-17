const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;

const QuestionModel = new Schema({
    _id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    // 问题标题
    title: {
        type: String,
        required: true
    },
    // 更新时间
    updatedTime:Number,
    url: String,
    // 浏览数
    visitCount: Number,
    // 是否可评论
    adminClosedComment: Boolean,
    // 答案个数
    answerCount: Number,
    // 提问者
    author: Object,
    //
    canComment: Object,
    // 被折叠的回答
    collapsedAnswerCount: Number,
    // 评论数
    commentCount: Number,
    // 评论权限
    commentPermission: String,
    // 创建
    created: Number,
    // 问题描述
    detail: String,
    editableDetail: String,
    excerpt: String,
    // 关注问题人数
    followerCount: Number,
    //
    hasPublishingDraft: Boolean,
    isEditable: Boolean,
    isMuted: Boolean,
    isNormal: Boolean,
    questionType: String,
    reviewInfo: Object,
    status: Object,
});

module.exports = mongoose.model('Questions', QuestionModel);