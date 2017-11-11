const mongoConnection = require('./../db/numberConnection');
const CollectionModel = require('./../db/collection');
const UserModel = require('./../db/numberSchema');
const request = require('superagent');
const cheerio = require('cheerio');
const jsonfile = require('jsonfile');
const path = require('path');

const skipFile = path.join(__dirname,'../skipConfig.json');

let skip;
let user;
let pageSkip = 1;
let collections = {};


(async function init() {
    await mongoConnection();

    skip = parseInt(jsonfile.readFileSync(skipFile).collectionSkip);
    await start();
})();

async function start() {
    await findUserColleaction();
    await write();
}

async function write() {
    for(let key in collections) {
        let currentCollection = collections[key];
        let existsCollection = await CollectionModel.find({id: currentCollection.id}).exec();

        if(existsCollection.length === 0) {
            let save = {
                title: currentCollection.title,
                url: currentCollection.url,
                answerCount: currentCollection.answerCount,
                updateTime: currentCollection.updateTime,
                followerCount: currentCollection.followerCount,
                isPublic: currentCollection.isPublic,
                id: currentCollection.id,
                find_by_user: user.urlToken
            };
            console.log(`开始保存`);
            await CollectionModel(save).save();
            console.log(`保存成功`);
        } else {
            console.log(`收藏夹 ${currentCollection.title} 已经存在数据库中`);
            console.log('\n');
        }
    }
    pageSkip++;
    await start();
}


function selectCollections(html) {
    const $ = cheerio.load(html);
    const data = JSON.parse($('#data').attr('data-state').toString());
    return data.entities.favlists;
}

async function findUserColleaction() {
    while(!user) {
        console.log(`从数据库中抓取用户`);
        console.log(`skip的值是 ${skip}`);

        user = await UserModel.findOne({}).skip(skip).exec();

        console.log(`抓取到用户 ${user.urlToken}`);

        let exists = await CollectionModel.find({"find_by_user": user.urlToken}).exec().length;
        if(exists) {
            user = '';
            skip++;
        }
    }

    console.log(`开始获取用户${user.urlToken}的关注收藏夹`);
    console.log('\n');

    const userCollectionUrl = `https://www.zhihu.com/people/${user.urlToken}/following/collections?page=${pageSkip}`;
    const userCollectionHtml = await request.get(userCollectionUrl).then(res => res.text).catch( async err => {
        console.log("出错");
        skip++;
        pageSkip = 0;
        user = '';
        collections = {};
        const skipData = jsonfile.readFileSync(skipFile);
        skipData.collectionSkip = Number(skipData.collectionSkip) + 1;
        jsonfile.writeFileSync(skipFile, skipData);
        await findUserColleaction();
    });
    collections = selectCollections(userCollectionHtml);

    console.log(`已经获取到收藏夹`);
    console.log(Object.keys(collections).length);
    console.log('\n');

    while(Object.keys(collections).length < 1) {
        console.log(`没有关注的收藏夹了`);
        skip++;
        pageSkip = 0;
        user = '';
        collections = {};
        const skipData = jsonfile.readFileSync(skipFile);
        skipData.collectionSkip = Number(skipData.collectionSkip) + 1;
        jsonfile.writeFileSync(skipFile, skipData);
        await findUserColleaction();
    }
}