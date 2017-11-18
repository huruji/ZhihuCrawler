const LiveModel = require('./../../db/live');
const UserModel = require('./../../db/user');
const SkipModel = require('./../../db/skip');
const request = require('superagent');
const cheerio = require('cheerio');
const log = console.log;

let skip;
let user;
let cookie = '';


let authorization = 'oauth 8274ffb553d511e6a7fdacbc328e205d';

module.exports = init;

async function init() {
    try{
        await getLive();
    } catch(err) {
        await errHandle()
    }

}
async function getLive(){
    let skips = await SkipModel.findOne().exec();
    skip = skips ? skips.liveSkip : 1;
    if(!skips) {
        await SkipModel({}).save();
    }
    user = await UserModel.findOne({"participatedLiveCount": {$gt:0}}).skip(skip).exec();

    log(`已经获取到了用户 ${user.name} 的数据`);

    let userIndex = await request
        .get(`https://www.zhihu.com/people/${user.urlToken}/activities`)
        .then(res => res.text).catch( async (err) => {
            await errHandle();
        });
    let $ = cheerio.load(userIndex);
    let liveUrl = $('.Profile-lightList a').eq(0).attr('href');
    if(!liveUrl) {
       return await errHandle();
    }
    let id = liveUrl.substr(liveUrl.lastIndexOf('/') + 1);

    log(`正在获取用户 ${user.name} 参与过的live`);
    log('\n');

    let liveApiUrl = `https://api.zhihu.com/people/${id}/lives`;
    let resData = await request.get(liveApiUrl)
        .set('cookie', 'cookie')
        .set('authorization', authorization)
        .then((res) => {
            return JSON.parse(res.text).data
        })
        .catch(async (err) => {
            await errHandle()
        });

    for(let i = 0; i < resData.length; i++) {
        let liveData = resData[i];
        let exists = await LiveModel.find({_id: liveData.id}).exec();
        if(exists.length===0) {
            let save = {
                _id: liveData.id,
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
            log(`开始保存live ${liveData.subject}`);
            await LiveModel(save).save();
            log(`保存成功`);
        } else {
            log(`live ${liveData.subject} 已经存在数据库中`);
        }
    }
    skip++;
    await SkipModel.update({},{$set:{liveSkip:skip}});
    await getLive();
}

async function errHandle() {
    log('出错了，重新开始抓取');
    skip++;
    await SkipModel.update({},{$set:{liveSkip:skip}});
    setTimeout(async () => {
        await getLive();
    }, 1000 * 5);
}