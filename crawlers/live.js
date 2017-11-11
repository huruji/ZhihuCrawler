const mongoConnection = require('./../db/numberConnection');
const LiveModel = require('./../db/live');
const request = require('superagent');
const cheerio = require('cheerio');
const jsonfile = require('jsonfile');
const path = require('path');

const skipFile = path.join(__dirname,'../skipConfig.json');

let skip;
let user;
let pageSkip = 1;
let collections = {};
let cookie = '';
let offset = 0;

const liveIndexUlr = 'https://www.zhihu.com/lives/';

let authorization = 'oauth 8274ffb553d511e6a7fdacbc328e205d';

/*(async function init() {
    await mongoConnection();

    skip = parseInt(jsonfile.readFileSync(skipFile).collectionSkip);
    await start();
})();

async function start() {
    await findUserColleaction();
    await write();
}*/

mongoConnection();
(async function getLiveIndex() {
    cookie = await request.get(liveIndexUlr).then((res) => res.header['set-cookie'][0].split(';')[0]);
    console.log(`获取到cookie为 ${cookie}`);
    console.log(`开始抓取offset=${offset} 的live`);
    let resData = await request.get(`https://api.zhihu.com/lives/homefeed?includes=live&limit=10&offset=${offset}`)
        .set('cookie', 'cookie')
        .set('authorization', authorization)
        .then((res) => JSON.parse(res.text).data);

    for(let i = 0; i < resData.length; i++) {
        let liveData = resData[i].live;
        let exists = await LiveModel.find({id: liveData.id}).exec();
        if(exists.length===0) {
            let save = {
                subject: liveData.subject,
                score: liveData.review.score,
                speaker: liveData.speaker,
                tags: liveData.tags,
                fee: liveData.fee.original_price,
                id: liveData.id,
                reviewCount: liveData.review.count,
                seats: liveData.seats.taken,
                status: liveData.status
            };
            console.log(`开始保存live ${liveData.subject}`);
            await LiveModel(save).save();
            console.log(`保存成功`);
        } else {
            console.log(`live ${liveData.subject} 已经存在数据库中`);
        }
        offset += resData.length;
        await getLiveIndex();
    }
}());