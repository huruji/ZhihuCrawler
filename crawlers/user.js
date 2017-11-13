const request = require('superagent');
const cheerio = require('cheerio');
const chalk = require('chalk');

const mongoConnection = require('./../db/numberConnection');
const UserModel = require('./../db/numberSchema');
const CONFIG_USER = require('./../config').user;

const log = console.log;

let continueCrawl = true;
let page = 1;
let startUserToken = '';
let users = [];
let startUser = {};
let urls = {};





(async function init() {
    await mongoConnection();
    await start();
}());

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
    log('-----------开始获取爬虫开始的用户-----------');
    let user = await UserModel.findOne({thankedCount: {$exists: false}}).exec().urlToken;
    if(!user) {
        user = getRandom(CONFIG_USER);
    }
    startUserToken = user;
    urls = {
        following: `https://www.zhihu.com/people/${startUserToken}/following`,
        followers: `https://www.zhihu.com/people/${startUserToken}/followers`
    };

    log(`获取到的用户的Token是 ${chalk.green(startUserToken)}`);
}

async function getFollowers() {

    log(`\n开始获取用户${startUserToken}的关注者，页面是 ${page}`);


    let url = `${urls.followers}?page=${page}`;
    const html = await request.get(url).then(res => res.text).catch( async (err) => {
        log(`${chalk.red('出错了，重新抓取')}`);
        page++;
        await getFollowers();
    });
    users = selectUser(html);
    if(page === 1) {
        await updateStartUser();
    }

    if(users.length > 0) {

        log(`\n此页面的用户数量大于1，将开始保存这些用户`);

        for(let i = 0; i < users.length; i++) {
            await writeUser(users[i]);
        }

    } else {

        log(`\n该用户已经没有了关注者，将开始获取该用户关注的用户`);

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

    log(`\n开始获取用户${startUserToken}关注的用户，页面是 ${page}`);

    let url = `${urls.following}?page=${page}`;
    const html = await request.get(url).then(res => res.text).catch(async (err) => {
        log(`${chalk.red('出错了，重新抓取')}`);
        page++;
        await getFollowings()
    });
    users = selectUser(html);
    if(users.length > 0) {

        log(`\n此页面的用户数量大于1，将开始保存这些用户`);

        for(let i = 0; i < users.length; i++) {
            await writeUser(users[i]);
        }
    } else {

        log(`\n该用户已经没有关注的人了，将开始获取其他用户的数据\n\n\n\n\n\n`);

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

        log(`\n开始更新用户 ${startUserToken} 的数据`);

        await UserModel.update({urlToken: startUser.urlToken}, startUser).exec();

        log(chalk.green('更新完成'));
    }
}

async function writeUser(user) {

    let exists = await UserModel.findOne({urlToken: user.urlToken}).exec();
    if(!exists) {

        log(`\n开始保存 ${user.name} ${user.urlToken} 的数据`);

        await UserModel(user).save();

        log(chalk.green('保存成功'));

    } else {
        log(`\n用户 ${user.name} ${user.urlToken} 已经存在数据库`);
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

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}
