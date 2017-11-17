const mongoConnection = require('./../db/connection');
const UserModel = require('./../db/user');
const request = require('superagent');
const cheerio = require('cheerio');

let skip = 12;
async function getUser() {
    let user = UserModel.findOne({'columnsCount': {$exists: false}}).skip(skip).exec();
    return user;
}

async function write(html, token) {
    skip++;
    console.log(`获取到了用户 ${token} 页面`);
    let $ = cheerio.load(html);
    let data = $('#data').attr('data-state');
    console.log('获取到了data');
    if(!data) {
        console.log(`用户 ${token} 数据不存在`);
        skip++;
        return await start();
    }
    console.log(data);
    data = JSON.parse(data.toString());
    console.log('\n');

    if(Object.keys(data.entities.users).length === 0) {
        setTimeout(function() {
            start()
        }, 600000);
        return;
    }

    if(data.entities.users[token]) {
        let userData = data.entities.users[token];
        let lastActive =  Object.keys(data.entities.activities).length > 0 ? transActivities(Object.keys(data.entities.activities)) : 0;
        console.log('\n');
        console.log(`开始更新用户 ${token} 的数据`);
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
            business: userData.business.name,
            avatarUrl: userData.avatarUrl,
            columnsCount: userData.columnsCount,
            thankToCount: userData.thankToCount,
            badge: userData.badge,
            coverUrl: userData.coverUrl,
            answerCount: userData.answerCount,
            articlesCount: userData.articlesCount,
            questionCount: userData.questionCount,
            locations: userData.locations[0] ? userData.locations[0].name : '',
            url: userData.url,
            followingQuestionCount: userData.followingQuestionCount,
            thankedCount: userData.thankedCount,
            gender: userData.gender,
            isActive: userData.isActive,
            signUpYear: new Date(userData.isActive * 1000).getFullYear(),
            lastActive: lastActive
        };
        await UserModel.update({urlToken: token},saveData).exec().then(()=>{},(err)=>{
            console.log(err);
        });
        console.log(`用户 ${token} 的数据更新完成`);
        console.log('\n');
    }

    skip++;
    start();
}

(async function init() {
    await mongoConnection();
    start();
})();

function transActivities(arr) {
    let numArr = arr.map((item) => {
        return Number(item);
    });
    return numArr[numArr.length - 1];
}

function start () {
    (async() => {
        let users = await getUser();

        console.log(users.urlToken);
        let url = 'https://www.zhihu.com/people/' + users.urlToken + '/activities';
        let html = await request.get(url).set('Referer', `https://www.zhihu.com/people/${users.urlToken}/following`).then(res => {
            console.log('success');
            return res.text},(err)=>{
            console.log('errrrrrrrrrr');
            skip++;
            start();
        });

        await write(html, users.urlToken);
        return 0;
    })()
}


