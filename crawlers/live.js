const mongoConnection = require('./../db/connection');
const LiveModel = require('./../db/live');
const UserModel = require('./../db/user');
const request = require('superagent');
const cheerio = require('cheerio');
const jsonfile = require('jsonfile');

const path = require('path');

const skipFile = path.join(__dirname,'../skipConfig.json');

let skip;
let user;
let cookie = '';


let authorization = 'oauth 8274ffb553d511e6a7fdacbc328e205d';

mongoConnection();

(async function() {
   await getLive();
})()
async function getLive(){
    skip = parseInt(jsonfile.readFileSync(skipFile).liveSkip);
    user = await UserModel.findOne({"participatedLiveCount": {$gt:0}}).skip(skip).exec();

    console.log(`已经获取到了用户 ${user.name} 的数据`);

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

    console.log(`正在获取用户 ${user.name} 参与过的live`);
    console.log('\n');

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
            console.log(`开始保存live ${liveData.subject}`);
            await LiveModel(save).save();
            console.log(`保存成功`);
        } else {
            console.log(`live ${liveData.subject} 已经存在数据库中`);
        }
    }
    skip++;
    const skipData = jsonfile.readFileSync(skipFile);
    skipData.liveSkip = Number(skipData.liveSkip) + 1;
    jsonfile.writeFileSync(skipFile, skipData);
    await getLive();
}

async function errHandle() {
    console.log('出错了，重新开始抓取');
    skip++;
    const skipData = jsonfile.readFileSync(skipFile);
    skipData.liveSkip = Number(skipData.liveSkip) + 1;
    jsonfile.writeFileSync(skipFile, skipData);
    setTimeout(async () => {
        await getLive();
    }, 1000 * 5);
}