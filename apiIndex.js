const request = require('superagent');
const cheerio = require('cheerio');
const merge = require('utils-merge');

const mongoConnection = require('./db/apiConnection');
const UserModel = require('./db/apiSchema');


const CONFIG_USER = require('./config').user;
const cookie = require('./config').cookie;

let START_USER = CONFIG_USER[1];

let INIT_USER = START_USER;

let followingContinue = true;
let followersContinue = true;
let followingPage = 1;
let followersPage = 1;

let urls = {
  following: `https://www.zhihu.com/api/v4/members/${START_USER}/followees?offset=0&limit=20`,
  followers: `https://www.zhihu.com/api/v4/members/${START_USER}/followers?offset=0&limit=20`
};
let user = {
  followers: [],
  following: []
};


(async function init() {
  await getFollowing(urls.following)
})();

async function getFollowing(url) {
  const res = request.get(url).set('cookie',cookie).then(res => res);
  console.log(res);
}

async function writePerson(data) {
  const user = await UserModel.findOne({url_token: data.url_token}).exec();
  if(user) {
    console.log('----------------');
    console.log(`用户 ${data.url_token} 已经存在数据库中`);
    console.log('----------------');
    return;
  }
  await UserModel(data).save()
}