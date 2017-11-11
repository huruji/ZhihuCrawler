const mongoConnection = require('./../db/numberConnection');
const ColumnModel = require('./../db/column');
const UserModel = require('./../db/numberSchema');
const request = require('superagent');
const cheerio = require('cheerio');
const jsonfile = require('jsonfile');
const path = require('path');

const skipFile = path.join(__dirname,'../skipConfig.json');

let skip;
let user;
let pageSkip = 1;
let column = {};


(async function init() {
    await mongoConnection();
    let num = await ColumnModel.findOne({}).count().exec();
    console.log(num);
    skip = parseInt(jsonfile.readFileSync(skipFile).columnSkip);
    await start();
})();

async function start() {
    await findUserColumns();
    await write();
}

async function write() {
    for(let key in column) {
        let currentColumn = column[key];
        let existsColumn = await ColumnModel.find({topicId: currentColumn.id}).exec();
        console.log(Array.isArray(existsColumn));
        if(existsColumn.length === 0) {
            let id = currentColumn.id;

            console.log(`抓取专栏 ${currentColumn.title} 的页面`);
            console.log('\n');

            let columnAboutUrl = `https://zhuanlan.zhihu.com/${id}/about`;
            let columnAboutHtml = await request.get(columnAboutUrl).then(res => res.text).catch(err => {
                setTimeout(async () => {
                    await start();
                },1000 * 5);
            });
            let intro = selectIntro(columnAboutHtml);
            let saveColumn = {
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
            console.log(`开始保存`);
            await ColumnModel(saveColumn).save();
            console.log(`保存成功`);
        } else {
            console.log(`专栏 ${currentColumn.title} 已经存在数据库中`);
            console.log('\n');
        }
    }
    pageSkip++;
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
        console.log(`从数据库中抓取用户`);
        console.log(`skip的值是 ${skip}`);

        user = await UserModel.findOne({}).skip(skip).exec();

        console.log(`抓取到用户 ${user.urlToken}`);

        let exists = await ColumnModel.find({"find_by_user": user.urlToken}).exec().length;
        if(exists) {
            user = '';
            skip++;
        }
    }

    console.log(`开始获取用户${user.urlToken}的关注专栏`);
    console.log('\n');

    const userTopicUrl = `https://www.zhihu.com/people/${user.urlToken}/following/columns?page=${pageSkip}`;
    const userTopicHtml = await request.get(userTopicUrl).then(res => res.text).catch(err => {
        console.log(err);
    });
    column = selectColumns(userTopicHtml);

    console.log(`已经获取到专栏`);
    console.log(Object.keys(column).length);
    console.log('\n');

    while(Object.keys(column).length < 1) {
        console.log(`没有关注的专栏了`);
        skip++;
        pageSkip = 0;
        user = '';
        column = {};
        const skipData = jsonfile.readFileSync(skipFile);
        skipData.columnSkip = Number(skipData.columnSkip) + 1;
        jsonfile.writeFileSync(skipFile, skipData);
        await findUserColumns();
    }
}