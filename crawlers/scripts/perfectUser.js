const UserModel = require('./../../db/user');
const request = require('superagent');
const cheerio = require('cheerio');
const log = console.log;

let skip = 1;

module.exports = init;

async function init() {
    start();
}

async function getUser() {
    let user = UserModel.findOne({'columnsCount': {$exists: false}}).skip(skip).exec();
    return user;
}

async function write(html, token) {
    skip++;
    log(`获取到了用户 ${token} 页面`);
    let $ = cheerio.load(html);
    let data = $('#data').attr('data-state');
    log('获取到了data');
    if(!data) {
        log(`用户 ${token} 数据不存在`);
        skip++;
        return await start();
    }
    data = JSON.parse(data.toString());
    log('\n');

    if(Object.keys(data.entities.users).length === 0) {
        setTimeout(function() {
            start()
        }, 600000);
        return;
    }

    if(data.entities.users[token]) {
        let userData = data.entities.users[token];
        let lastActive =  Object.keys(data.entities.activities).length > 0 ? transActivities(Object.keys(data.entities.activities)) : 0;
        log('\n');
        log(`开始更新用户 ${token} 的数据`);
        console.log(userData.locations);
        console.log(lastActive);
        let saveData = {
            _id: userData.urlToken,
            name: userData.name,
            userType: userData.userType,
            favoriteCount: userData.favoriteCount,
            voteupCount: userData.voteupCount,
            commercialQuestionCount: userData.commercialQuestionCount,
            followingColumnsCount: userData.followingColumnsCount,
            headline: userData.headline,
            urlToken: userData.urlToken,
            participatedLiveCount: userData.participatedLiveCount,
            favoritedCount: userData.favoritedCount,
            isOrg: userData.isOrg,
            followerCount: userData.followerCount,
            employments: userData.employments,
            avatarUrlTemplate: userData.employments,
            followingTopicCount: userData.followingTopicCount,
            description: userData.description,
            business: userData.business ? userData.business.name : "",
            avatarUrl: userData.avatarUrl,
            columnsCount: userData.columnsCount,
            thankToCount: userData.thankToCount,
            badge: userData.badge,
            coverUrl: userData.coverUrl,
            answerCount: userData.answerCount,
            articlesCount: userData.articlesCount,
            questionCount: userData.questionCount,
            locations: userData.locations.length > 0 ? userData.locations[0].name : '',
            url: userData.url,
            followingQuestionCount: userData.followingQuestionCount,
            thankedCount: userData.thankedCount,
            gender: userData.gender,
            isActive: userData.isActive,
            signUpYear: new Date(userData.isActive * 1000).getFullYear(),
            lastActive: lastActive,
            updatedAt: parseInt(new Date().getTime() / 1000)
        };
        await UserModel.update({_id: token},{$set: saveData}).exec().then(()=>{},(err)=>{
            log(err);
        });
        log(`用户 ${token} 的数据更新完成`);
        log('\n');
    }

    skip++;
    start();
}

function transActivities(arr) {
    let numArr = arr.map((item) => {
        return Number(item);
    });
    return numArr[numArr.length - 1];
}

function start () {
    (async() => {
        let users = await getUser();

        log(users.urlToken);
        let url = 'https://www.zhihu.com/people/' + users.urlToken + '/activities';
        let html = await request.get(url).set('Referer', `https://www.zhihu.com/people/${users.urlToken}/following`).then(res => {
            log('success');
            return res.text},(err)=>{
            log('errrrrrrrrrr');
            skip++;
            start();
        });

        await write(html, users._id);
        return 0;
    })()
}


