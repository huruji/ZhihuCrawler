const ColumnModel = require('./../../db/column');
const UserModel = require('./../../db/user');
const SkipModel = require('./../../db/skip');
const request = require('superagent');
const cheerio = require('cheerio');
const log = console.log;

let skip;
let user;
let pageSkip = 1;
let column = {};

module.exports = init;

async function init() {
    let skips = await SkipModel.findOne().exec();
    skip = skips ? skips.columnSkip : 1;
    if(!skips) {
        await SkipModel({}).save();
    }
    await start();
}

async function start() {
    try{
        await findUserColumns();
        await write();
    } catch(err) {
        await errHandle()
    }

}

async function write() {
    for(let key in column) {
        let currentColumn = column[key];
        let existsColumn = await ColumnModel.find({_id: currentColumn.id}).exec();

        if(existsColumn.length === 0) {
            let id = currentColumn.id;

            log(`抓取专栏 ${currentColumn.title} 的页面`);
            log('\n');

            let columnAboutUrl = `https://zhuanlan.zhihu.com/${id}/about`;

            let columnAboutHtml = await request.get(columnAboutUrl).then(res => res.text).catch( async (err) => {
                await errHandle();
            });

            let intro = selectIntro(columnAboutHtml);
            let saveColumn = {
                _id: currentColumn.id,
                title: currentColumn.title,
                intro: intro,
                imageUrl: currentColumn.imageUrl,
                id: currentColumn.id,
                followers: currentColumn.followers,
                articlesCount: currentColumn.articlesCount,
                commentPermission: currentColumn.commentPermission,
                url: currentColumn.url,
                author: currentColumn.author,
                updated: currentColumn.updated,
                find_by_user: user.urlToken
            };
            log(`开始保存`);
            await ColumnModel(saveColumn).save();
            log(`保存成功`);
        } else {
            log(`专栏 ${currentColumn.title} 已经存在数据库中`);
            log('\n');
        }
    }
    pageSkip++;
    await SkipModel.update({},{$set:{columnSkip:skip}});
    await start();
}

function selectIntro(html) {
    const $ = cheerio.load(html);
    return $('.AboutIndex-descriptionWrapper p').text();
}

function selectColumns(html) {
    const $ = cheerio.load(html);
    const data = JSON.parse($('#data').attr('data-state').toString());
    return data.entities.columns;
}

async function findUserColumns() {
    while(!user) {
        log(`从数据库中抓取用户`);
        log(`skip的值是 ${skip}`);

        user = await UserModel.findOne({}).skip(skip).exec();

        log(`抓取到用户 ${user.urlToken}`);

        let exists = await ColumnModel.find({"find_by_user": user.urlToken}).exec().length;
        if(exists) {
            user = '';
            skip++;
        }
    }

    log(`开始获取用户 ${user.urlToken} 的关注专栏`);
    log('\n');

    const userTopicUrl = `https://www.zhihu.com/people/${user.urlToken}/following/columns?page=${pageSkip}`;

    const userTopicHtml = await request.get(userTopicUrl).then(res => res.text).catch( async (err) => {
        await errHandle();
    });

    column = selectColumns(userTopicHtml);

    while(Object.keys(column).length < 1) {
        await noColumnHandle();
    }

    log(`已经获取到专栏`);
    log(Object.keys(column).length);
    log('\n');
}

async function errHandle() {
    log('出错了，重新抓取');
    await reStart();
}

async function noColumnHandle() {
    log(`没有关注的专栏了`);
    await reStart();
}

async function reStart() {
    skip++;
    pageSkip = 0;
    user = '';
    column = {};
    await SkipModel.update({},{$set:{columnSkip:skip}});
    await findUserColumns();
}