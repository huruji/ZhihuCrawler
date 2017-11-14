const mongoConnection = require('./../db/connection');
const TopicModel = require('./../db/topic');
const UserModel = require('./../db/user');
const request = require('superagent');
const cheerio = require('cheerio');
const jsonfile = require('jsonfile');
const path = require('path');

const skipFile = path.join(__dirname,'../skipConfig.json');

let skip;
let user;
let pageSkip = 1;
let topic = {};


(async function init() {
    await mongoConnection();
    let num = await TopicModel.findOne({}).count().exec();
    console.log(num);
    skip = Number(jsonfile.readFileSync(skipFile).topicSkip);
    await start();
})();

async function start() {
    await findUserTopics();
    await write();
}

async function write() {
    for(let key in topic) {
        let currentTopic = topic[key];
        let existsTopic = await TopicModel.find({topicId: currentTopic.id}).exec();

        if(existsTopic.length === 0) {
            let id = currentTopic.id;

            console.log(`抓取话题 ${currentTopic.name} 的页面`);
            console.log('\n');

            let topicHotUrl = `https://www.zhihu.com/topic/${id}/hot`;
            let topicHotHtml = await request.get(topicHotUrl).then(res => res.text).catch( async (err) => {
                await errHandle();
            });
            let followers = selectFollowers(topicHotHtml);
            let saveTopic = {
                name: currentTopic.name,
                avatarUrl: currentTopic.avatarUrl,
                introduction: currentTopic.introduction,
                url: currentTopic.url,
                excerpt: currentTopic.excerpt,
                topicId: id,
                followers: followers,
                find_by_user: user
            };
            console.log(`开始保存`);
            await TopicModel(saveTopic).save();
            console.log(`保存成功`);
        } else {
            console.log(`话题 ${currentTopic.name} 已经存在数据库中`);
            console.log('\n');
        }
    }
    pageSkip++;
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

         console.log(`从数据库中抓取用户`);
         console.log(`skip的值是 ${skip}`);

         user = await UserModel.findOne({'columnsCount': {$exists: true}}).skip(skip).exec();

         console.log(`抓取到用户 ${user.urlToken}`);

         let exists = await TopicModel.find({"find_by_user": user.urlToken}).exec().length;
         if(exists) {
             user = '';
             skip++;
         }
    }

    console.log(`开始获取用户${user.urlToken}的关注话题`);
    console.log('\n');

    const userTopicUrl = `https://www.zhihu.com/people/${user.urlToken}/following/topics?page=${pageSkip}`;
    const userTopicHtml = await request.get(userTopicUrl).then(res => res.text).catch( async (err) => {
        await errHandle();
    });
    topic = selectTopics(userTopicHtml);



    while(Object.keys(topic).length < 1) {
        await noDataHandle();
    }

    console.log(`已经获取到话题`);
    console.log(Object.keys(topic).length);
    console.log('\n');
}


async function errHandle() {
    console.log('出错了，重新抓取');
    await reStart();
}

async function noDataHandle() {
    console.log('没有关注的话题了');
    await reStart();
}

async function reStart() {
    skip++;
    pageSkip = 0;
    user = '';
    topic = {};
    const skipData = jsonfile.readFileSync(skipFile);
    skipData.topicSkip = Number(skipData.topicSkip) + 1;
    jsonfile.writeFileSync(skipFile, skipData);
    await findUserTopics();
}