const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;

const QuestionModel = new Schema({
  // 是否可评论
  adminClosedComment: {
    type: Boolean
  },
  // 答案个数
  answerCount: {
    type:Number
  },
  // 提问者
  author: {
    type: Object
  },
  //
  canComment: {
    type: Object
  },
  // 被折叠的回答
  collapsedAnswerCount: {
    type: Number
  },
  // 评论数
  commentCount: {
    type: Number
  },
  // 评论权限
  commentPermission: {
    type: String
  },
  // 创建
  created: {
    type: Number
  },
  // 问题描述
  detail: {
    type: String
  },
  editableDetail: {
    type: String
  },
  excerpt: {
    type: String
  },
  // 关注问题人数
  followerCount: {
    type: Number
  },
  // 
  hasPublishingDraft: {
    type: Boolean
  },
  id: {
    type: Number,
  },
  isEditable: {
    type: Boolean
  },
  isMuted: {
    type: Boolean
  },
  isNormal: {
    type: Boolean
  },
  questionType: {
    type: String
  },
  relationship: {
    type: Object
  },
  reviewInfo: {
    type: Object
  },
  status: {
    type:Object
  },
  // 问题标题
  title: {
    type: String,
    required: true
  },
  // 话题
  topics: {
    type: Array
  },
  type: {
    type: String
  },
  // 更新时间
  updatedTime: {
    type: Number
  },
  url: {
    type: String
  },
  // 浏览数
  visitCount: {
    type: Number
  }
});

module.exports = mongoose.model('Questions', QuestionModel);