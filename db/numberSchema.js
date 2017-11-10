const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;

const UserSchema = new Schema({
  // 姓名
  name: {
    type: String,
    index: true,
    require: true,
  },
  // 类型
  userType: {
    type: String
  },
  id: {
    type: String
  },
  //
  favoriteCount:{
    type: Number
  },
  // 获得赞同数
  voteupCount: {
    type: Number
  },
  //
  commercialQuestionCount: {
    type: Number
  },
  // 关注的专栏数
  followingColumnsCount: {
    type: Number
  },
  // 个性签名
  headline: {
    type: String
  },
  // token
  urlToken: {
    type: String
  },
  // 参与的live数量
  participatedLiveCount: {
    type: Number
  },
  // 被收藏数
  favoritedCount: {
    type: Number
  },
  // 是否是机构
  isOrg: {
    type: Boolean
  },
  // 关注者
  followerCount: {
    type: Number
  },
  // 工作
  employments: {
    type: Array
  },
  // 头像模板
  avatarUrlTemplate: {
    type: String
  },
  // 关注的话题数量
  followingTopicCount: {
    type: Number
  },
  // 个性描述
  description: {
    type: String
  },
  // 工作
  business: {
    type: Object
  },
  // 头像
  avatarUrl: {
    type: String
  },
  // 专栏数量
  columnsCount: {
    type: Number
  },
  //
  thankToCount: {
    type: Number
  },
  // 荣誉
  badge: {
    type: Array
  },
  // 封面
  coverUrl: {
    type: String
  },
  // 回答问题数量
  answerCount: {
    type: String
  },
  // 文章数
  articlesCount: {
    type: Number
  },
  // 提问数
  questionCount: {
    type: Number
  },
  // 居住地
  locations: {
    type: Array
  },
  // api的url
  url: {
    type: String
  },
  // 关注的问题数量
  followingQuestionCount: {
    type: Number
  },
  // 获得感谢数量
  thankedCount: {
    type: Number
  },
  // 数量
  gender: {
    type: Number
  },
  create_time: Date,
  answers: {
    type: Object
  }
});

module.exports = mongoose.model('User', UserSchema);
