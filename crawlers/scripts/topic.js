const TopicModel = require('./../../db/topic');
const UserModel = require('./../../db/user');
const SkipModel = require('./../../db/skip');
const request = require('superagent');
const cheerio = require('cheerio');
const log = console.log;

let skip;
let user;
let pageSkip = 1;
let topic = {};

module.exports = init;

async function init() {
    let skips = await SkipModel.findOne().exec();
    skip = skips ? skips.topicSkip : 1;
    if(!skips) {
        await SkipModel({}).save();
    }
    await start();
}

async function start() {
    try{
        await findUserTopics();
        await write();
    } catch (err) {
        await errHandle();
    }
}

async function write() {
    for(let key in topic) {
        let currentTopic = topic[key];
        let existsTopic = await TopicModel.find({_id: currentTopic.id}).exec();

        if(existsTopic.length === 0) {
            let id = currentTopic.id;

            log(`抓取话题 ${currentTopic.name} 的页面`);
            log('\n');

            let topicHotUrl = `https://www.zhihu.com/topic/${id}/hot`;
            let topicHotHtml = await request.get(topicHotUrl).then(res => res.text).catch( async (err) => {
                await errHandle();
            });
            let followers = selectFollowers(topicHotHtml);
            let saveTopic = {
                _id: id,
                name: currentTopic.name,
                avatarUrl: currentTopic.avatarUrl,
                introduction: currentTopic.introduction,
                url: currentTopic.url,
                excerpt: currentTopic.excerpt,
                topicId: id,
                followers: followers,
                find_by_user: user
            };
            log(`开始保存`);
            await TopicModel(saveTopic).save();
            log(`保存成功`);
        } else {
            log(`话题 ${currentTopic.name} 已经存在数据库中`);
            log('\n');
        }
    }
    pageSkip++;
    await SkipModel.update({},{$set:{topicSkip:skip}});
    await start();
}

function selectFollowers(html) {
    const $ = cheerio.load(html);
    return $('.zm-topic-side-followers-info strong').text();
}

function selectTopics(html) {
    const $ = cheerio.load(html);
    if(!$('#data').attr('data-state')) {
        return errHandle();
    }
    const data = JSON.parse($('#data').attr('data-state').toString());
    return data.entities.topics;
}

async function findUserTopics() {
    while(!user) {

         log(`从数据库中抓取用户`);
         log(`skip的值是 ${skip}`);

         user = await UserModel.findOne({}).skip(skip).exec();

         log(`抓取到用户 ${user.urlToken}`);

         let exists = await TopicModel.find({"find_by_user": user.urlToken}).exec().length;
         if(exists) {
             user = '';
             skip++;
         }
    }

    log(`开始获取用户${user.urlToken}的关注话题`);
    log('\n');

    const userTopicUrl = `https://www.zhihu.com/people/${user.urlToken}/following/topics?page=${pageSkip}`;
    const userTopicHtml = await request.get(userTopicUrl).then(res => res.text).catch( async (err) => {
        await errHandle();
    });
    topic = selectTopics(userTopicHtml);



    while(Object.keys(topic).length < 1) {
        await noDataHandle();
    }

    log(`已经获取到话题`);
    log(Object.keys(topic).length);
    log('\n');
}

async function errHandle() {
    log('出错了，重新抓取');
    await reStart();
}

async function noDataHandle() {
    log('没有关注的话题了');
    await reStart();
}

async function reStart() {
    skip++;
    pageSkip = 0;
    user = '';
    topic = {};
    await SkipModel.update({},{$set:{topicSkip:skip}});
    await findUserTopics();
}