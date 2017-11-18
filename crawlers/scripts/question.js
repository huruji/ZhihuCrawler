const QuestionModel = require('./../../db/question');
const UserModel = require('./../../db/user');
const SkipModel = require('./../../db/skip');
const request = require('superagent');
const cheerio = require('cheerio');
const log = console.log;

let skip;
let user;
let pageSkip = 1;
let questions = {};

module.exports = init;

async function init() {
    let skips = await SkipModel.findOne().exec();
    skip = skips ? skips.questionSkip : 1;
    if(!skips) {
        await SkipModel({}).save();
    }
    await start();
}

async function start() {
    try{
        await findUserQuestion();
        await write();
    } catch(err) {
        await errHandle()
    }

}

async function write() {
    for(let key in questions) {
        let currentQuestion = questions[key];
        let existsQuestion = await QuestionModel.find({_id: currentQuestion.id}).exec();

        if(existsQuestion.length === 0) {
            let  question = currentQuestion;
            let save = {
                _id: question.id,
                title: question.title,
                updatedTime: question.updatedTime,
                url: question.url,
                visitCount: question.visitCount,
                adminClosedComment: question.adminClosedComment,
                answerCount: question.answerCount,
                author: question.author,
                canComment: question.canComment,
                collapsedAnswerCount: question.collapsedAnswerCount,
                commentCount: question.commentCount,
                commentPermission: question.commentPermission,
                created: question.created,
                detail: question.detail,
                editableDetail: question.editableDetail,
                excerpt: question.excerpt,
                followerCount: question.followerCount,
                hasPublishingDraft: question.hasPublishingDraft,
                isEditable: question.isEditable,
                isMuted: question.isMuted,
                isNormal: question.isNormal,
                questionType: question.questionType,
                reviewInfo:  question.reviewInfo,
                status: question.status,
                find_by_user: user
            };
            log(`开始保存`);
            await QuestionModel(save).save();
            log(`保存成功`);
        } else {
            log(`问题 ${currentQuestion.title} 已经存在数据库中`);
            log('\n');
        }
    }
    pageSkip++;
    await SkipModel.update({},{$set:{questionSkip:skip}});
    await start();
}

async function selectQuestions(html) {
    const $ = cheerio.load(html);
    if( !$('#data').attr('data-state')) {
        return await errHandle();
    }
    const data = JSON.parse($('#data').attr('data-state').toString());
    return data.entities.questions;
}

async function findUserQuestion() {
    while(!user) {
        log(`从数据库中抓取用户`);
        log(`skip的值是 ${skip}`);

        user = await UserModel.findOne({}).skip(skip).exec();

        log(`抓取到用户 ${user.urlToken}`);

        let exists = await QuestionModel.find({"find_by_user": user.urlToken}).exec().length;
        if(exists) {
            user = '';
            skip++;
        }
    }

    log(`开始获取用户${user.urlToken}关注的问题`);
    log('\n');

    const userCollectionUrl = `https://www.zhihu.com/people/${user.urlToken}/following/questions?page=${pageSkip}`;
    const userCollectionHtml = await request.get(userCollectionUrl).then(res => res.text).catch( async err => {
        await errHandle();
    });

    questions = await selectQuestions(userCollectionHtml);


    while(Object.keys(questions).length < 1) {
        await noDataHandle();
    }

    log(`已经获取到问题`);
    log(Object.keys(questions).length);
    log('\n');
}

async function errHandle() {
    log("出错了，重新抓取");
    await reStart();
}

async function noDataHandle() {
    log("没有关注的收藏夹了");
    await reStart();
}

async function reStart() {
    skip++;
    pageSkip = 0;
    user = '';
    questions = {};
    await SkipModel.update({},{$set:{questionSkip:skip}});
    await findUserQuestion();
}