const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;

const UserSchema = new Schema({
    _id:{
        type: String,
        required: true,
        unique: true,
        index:true
    },
    // 姓名
    name: {
        type: String,
        required: true,
    },
    // 类型
    userType: String,
    // 自己收藏夹数
    favoriteCount: Number,
    // 获得赞同数
    voteupCount: Number,
    // 广告问题数
    commercialQuestionCount: Number,
    // 关注的专栏数
    followingColumnsCount: Number,
    // 个性签名
    headline: String,
    // token
    urlToken: String,
    // 参与的live数量
    participatedLiveCount: Number,
    // 被收藏数
    favoritedCount: Number,
    // 是否是机构
    isOrg: Boolean,
    // 关注者
    followerCount: Number,
    // 工作
    employments: Array,
    // 头像模板
    avatarUrlTemplate: String,
    // 关注的话题数量
    followingTopicCount: Number,
    // 个性描述
    description: String,
    // 工作
    business: String,
    // 头像
    avatarUrl: String,
    // 专栏数量
    columnsCount: Number,
    // 感谢他人数
    thankToCount: Number,
    // 荣誉
    badge: Array,
    // 封面
    coverUrl: String,
    // 回答问题数量
    answerCount: Number,
    // 文章数
    articlesCount: Number,
    // 提问数
    questionCount: Number,
    // 居住地
    locations: String,
    // api的url
    url: String,
    // 关注的问题数量
    followingQuestionCount: Number,
    // 获得感谢数量
    thankedCount: Number,
    // 性别
    gender: Number,
    // 注册时间
    isActive: Number,
    // 注册年份
    signUpYear: Number,
    // 最近一次活跃时间
    lastActive: Number,
    // 创建时间
    createdAt: {
        type: Number,
        default: parseInt(new Date().getTime() / 1000)
    },
    // 更新时间
    updatedAt: {
        type: Number,
        default: parseInt(new Date().getTime() / 1000)
    }
});

module.exports = mongoose.model('User', UserSchema);
