const request = require('superagent');
const cheerio = require('cheerio');

const mongoConnection = require('./../db/numberConnection');
const UserModel = require('./../db/numberSchema');
const CONFIG_USER = require('./../config').user;




let continueCrawl = true;
let page = 1;
let startUserToken = '';
let users = [];
let startUser = {};
let urls = {};

mongoConnection();


async function start() {
    await getStartUser();
    await getFollowers();
    continueCrawl = true;
    await getFollowings();
}

function initVariable() {
    continueCrawl = true;
    page = 1;
    startUserToken = '';
    users = [];
    startUser = {};
    urls = {};
}

async function getStartUser() {
    let user = await UserModel.findOne({thankedCount: {$exists: false}}).exec().urlToken;
    if(!user) {
        user = CONFIG_USER[Math.floor(Math.random() * CONFIG_USER.length)]
    }
    startUserToken = user;
    urls = {
        following: `https://www.zhihu.com/people/${startUserToken}/following`,
        followers: `https://www.zhihu.com/people/${startUserToken}/followers`
    };
}

async function getFollowers() {
    let url = `${urls.followers}?page=${page}`;
    const html = await request.get(url).then(res => res.text).catch(err => {

    });
    users = selectUser(html);
    if(page === 1) {
        await updateStartUser();
    }

    if(users.length > 0) {
        for(let i = 0; i < users.length; i++) {
            await writeUser(users[i]);
        }
    } else {
        continueCrawl = false;
        page = 0;
        users = [];
    }

    while (continueCrawl) {
        page++;
        await getFollowings();
    }
}

async function getFollowings() {
    let url = `${urls.following}?page=${page}`;
    const html = await request.get(url).then(res => res.text).catch(err => {

    });
    users = selectUser(html);
    if(users.length > 0) {
        for(let i = 0; i < users.length; i++) {
            await writeUser(users[i]);
        }
    } else {
        initVariable();
        return await start();
    }

    while (continueCrawl) {
        page++;
        await getFollowers();
    }
}

async function updateStartUser() {
    let exists = await UserModel.findOne({urlToken: startUser.urlToken}).exec();
    if(exists) {
        await UserModel.update({urlToken: startUser.urlToken}, startUser).exec();
    }
}

async function writeUser(user) {
    let exists = await UserModel.findOne({urlToken: user.urlToken}).exec();
    if(!exists) {
        await UserModel(user).save();
    }
}

function selectUser(html) {
    let user = [];

    const $ = cheerio.load(html);

    const data = JSON.parse($('#data').attr('data-state').toString());


    let keys = Object.keys(data.entities.users);

    if(keys.length===0 ||(keys.length === 1 && keys.includes(start))){
        console.log('\n');
        console.log('\n');
        console.log('\n');
        console.log('\n');
        console.log('只有本人');
        console.log('\n');
        console.log('\n');
        console.log('\n');
        console.log('\n');
        return user;
    }
    for(let key in data.entities.users) {
        let userData = data.entities.users[key];
        let item = {};
        if(data.entities.users[key].urlToken === startUser) {
            startUser = {
                name: userData.name,
                userType: userData.userType,
                id: userData.id,
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
                business: userData.business,
                avatarUrl: userData.avatarUrl,
                columnsCount: userData.columnsCount,
                thankToCount: userData.thankToCount,
                badge: userData.badge,
                coverUrl: userData.coverUrl,
                answerCount: userData.answerCount,
                articlesCount: userData.articlesCount,
                questionCount: userData.questionCount,
                locations: userData.locations,
                url: userData.url,
                followingQuestionCount: userData.followingQuestionCount,
                thankedCount: userData.thankedCount,
                gender: userData.gender
            };
        } else {
            item = {
                avatarUrlTemplate: userData.avatarUrlTemplate,
                userType: userData.userType,
                answerCount: userData.answerCount,
                url: userData.url,
                urlToken: userData.urlToken,
                id: userData.id,
                articlesCount: userData.articlesCount,
                name: userData.name,
                headline: userData.headline,
                gender: userData.gender,
                avatarUrl: userData.avatarUrl,
                isOrg: userData.isOrg,
                followerCount: userData.followerCount
            };
            user.push(item);
        }
    }
    return user;
}




