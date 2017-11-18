const CollectionModel = require('./../../db/collection');
const UserModel = require('./../../db/user');
const SkipModel = require('./../../db/skip');
const request = require('superagent');
const cheerio = require('cheerio');
const log = console.log;

let skip;
let user;
let pageSkip = 1;
let collections = {};


module.exports = init;

async function init() {
    let skips = await SkipModel.findOne().exec();
    skip = skips ? skips.collectionSkip : 1;
    if(!skips) {
        await SkipModel({}).save();
    }
    await start();
}

async function start() {
    try{
        await findUserColleaction();
        await write();
    } catch(err) {
        await errHandle()
    }

}

async function write() {
    for(let key in collections) {
        let currentCollection = collections[key];
        let existsCollection = await CollectionModel.find({_id: currentCollection.id}).exec();

        if(existsCollection.length === 0) {
            let save = {
                _id: currentCollection.id,
                title: currentCollection.title,
                url: currentCollection.url,
                answerCount: currentCollection.answerCount,
                updateTime: currentCollection.updateTime,
                followerCount: currentCollection.followerCount,
                isPublic: currentCollection.isPublic,
                id: currentCollection.id,
                find_by_user: user.urlToken
            };
            log(`开始保存`);
            await CollectionModel(save).save();
            log(`保存成功`);
        } else {
            log(`收藏夹 ${currentCollection.title} 已经存在数据库中`);
            log('\n');
        }
    }
    pageSkip++;
    await SkipModel.update({},{$set:{collectionSkip:skip}});
    await start();
}


async function selectCollections(html) {
    const $ = cheerio.load(html);
    if( !$('#data').attr('data-state')) {
      return await errHandle();
    }
    const data = JSON.parse($('#data').attr('data-state').toString());
    return data.entities.favlists;
}

async function findUserColleaction() {
    while(!user) {
        log(`从数据库中抓取用户`);
        log(`skip的值是 ${skip}`);

        user = await UserModel.findOne({}).skip(skip).exec();

        log(`抓取到用户 ${user.urlToken}`);

        let exists = await CollectionModel.find({"find_by_user": user.urlToken}).exec().length;
        if(exists) {
            user = '';
            skip++;
        }
    }

    log(`开始获取用户${user.urlToken}的关注收藏夹`);
    log('\n');

    const userCollectionUrl = `https://www.zhihu.com/people/${user.urlToken}/following/collections?page=${pageSkip}`;
    const userCollectionHtml = await request.get(userCollectionUrl).then(res => res.text).catch( async err => {
        await errHandle();
    });

    collections = await selectCollections(userCollectionHtml);


    while(Object.keys(collections).length < 1) {
        await noDataHandle();
    }

    log(`已经获取到收藏夹`);
    log(Object.keys(collections).length);
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
    collections = {};
    await SkipModel.update({},{$set:{collectionSkip:skip}});
    await findUserColleaction();
}