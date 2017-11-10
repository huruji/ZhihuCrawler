const request = require('superagent');
const cheerio = require('cheerio');
const merge = require('utils-merge');

const mongoConnection = require('./db/numberConnection');
const UserModel = require('./db/numberSchema');


const CONFIG_USER = require('./config').user;

let START_USER = CONFIG_USER[Math.floor(Math.random() * CONFIG_USER.length)];

/*START_USER = 'zhang-jia-wei';*/


let followingContinue = true;
let followersContinue = true;
let followingPage = 1;
let followersPage = 25090;

let startUser ={};
let users = [];

let urls = {
  following: `https://www.zhihu.com/people/${START_USER}/following`,
  followers: `https://www.zhihu.com/people/${START_USER}/followers`
};


(async function init(urls){
  await mongoConnection();
  getUserInfo(urls)
})(urls);

function getUserInfo(urls) {

  console.log('\n');
  console.log('\n');
  console.log('-------------------------------------------------------')
  console.log(`开始抓取用户 ${START_USER} 的数据`);
  console.log('-------------------------------------------------------')
  console.log('\n');
  console.log('\n');


  (async function getIndex(urls) {

    console.log('抓取followers');
    await getFollowers(urls.followers);

    if(!startUser.urlToken) {
      await errorManager();
      return;
    } else {
      await writeIndexUser();
    }

    /*console.log('抓取followings');
    await getFollowing(urls.following);



    if(!startUser.urlToken) {
      await errorManager();
      return;
    } else {
      await writeIndexUser();
    }*/

    console.log('\n');

    console.log('\n');

    await continueGet();
  })(urls);


}

async function errorManager() {
    console.log('\n');
    console.log('\n');
    console.log('-------------------------------------------------------');
    console.log('\n');
    console.log('\n');
    console.log(`出错了，5分钟后再抓取数据`);
    console.log('\n');
    console.log('\n');
    console.log('-------------------------------------------------------');
    console.log('\n');
    console.log('\n');
    setTimeout(function(){
      (async ()=>{
        await continueGet();
      })()
    }, 300000);
}

async function writeIndexUser() {
  console.log(`开始保存 ${startUser.urlToken} 的数据`);

  let startUserDatabase = await UserModel.findOne({urlToken: startUser.urlToken}).exec();
  if(startUserDatabase) {
    console.log('\n');
    console.log(`${startUser.urlToken} 已经存在，开始更新`);

    await UserModel.update({urlToken: startUser.urlToken}, startUser).exec();

    console.log(`${startUser.urlToken} 数据更新完成`);
    console.log('\n');
  } else {
    await UserModel(startUser).save();

    console.log(`${startUser.urlToken} 数据保存完成`);
  }
}

async function getFollowers(url) {

  let manageUrl = `${url}?page=${followersPage}`;

  console.log('抓取followers页面：',manageUrl);

  const html = await request.get(manageUrl).then(res => res.text).catch(err => {
    if(err) {
      setTimeout(function(){
        (async ()=>{
          await continueGet();
        })()
      }, 5000);
    }
  });

  const userFollowers = selectUserFollowers(html);

  Array.prototype.push.apply(users,userFollowers);

  if(users.length === 0) {
    return;
  }

  let num = 0;
  for(let i=0; i< users.length; i++) {
    console.log(`开始保存 followers ${users[i].urlToken} 的数据`);
    let userMini = await UserModel.find({urlToken: users[i].urlToken}).exec();

    if(userMini.length === 0) {
      num++;
      await UserModel(users[i]).save();
      console.log(` followers ${users[i].urlToken} 的数据保存成功`);
    } else {
      console.log('\n');
      console.log(` followers ${users[i].urlToken} 已经存在数据库`);
      console.log('\n');
    }
  }
  console.log('\n');
  console.log('\n');
  console.log('\n');
  console.log('\n');
  console.log(`此次增加 ${num} 个数据`);
  console.log('\n');
  console.log('\n');
  console.log('\n');
  console.log('\n');

  users = [];

  if(followersContinue) {
    followersPage += 1;
    return setTimeout( async ()=>{
      await getFollowers(url);
    }, 100);
  }
}

async function continueGet() {
  /*let dataUser = await UserModel.find({thankedCount: {$exists: false}});
  if(dataUser.length) {
    const index = Math.floor(Math.random() * dataUser.length);
    START_USER = dataUser[index].urlToken;
  } else {
    START_USER = CONFIG_USER[Math.floor(Math.random() * CONFIG_USER.length)];
  }*/
  START_USER = CONFIG_USER[Math.floor(Math.random() * CONFIG_USER.length)];
  followingContinue = true;
  followersContinue = true;
  followingPage = 1;
  followersPage +=1;
  urls = {
    following: `https://www.zhihu.com/people/${START_USER}/following`,
    followers: `https://www.zhihu.com/people/${START_USER}/followers`
  };

  users = [];

  getUserInfo(urls);
}

async function getFollowing(url) {

  let manageUrl = `${url}?page=${followingPage}`;

  console.log('抓取following页面：',manageUrl);
  const html = await request.get(manageUrl).then(res => res.text).catch(err => {
    if(err) {
      console.log('\n')
      console.log('\n')
      console.log('\n')
      console.log('\n')
      console.log('\n')
      console.log('\n')
      console.log('\n')
      console.log('error');
      console.log('\n')
      console.log('\n')
      console.log('\n')
      console.log('\n')
      console.log('\n')
      console.log('\n')
      console.log('\n')
      setTimeout(function(){
        (async ()=>{
          await continueGet();
        })()
      }, 5000);
    }
  });

  const userFollowing = selectUserFollowing(html);



  Array.prototype.push.apply(users, userFollowing);

  if(users.length === 0) {
    return;
  }

  let num = 0;
  for(let i=0; i< users.length; i++) {
    console.log(`开始保存 following ${users[i].urlToken} 的数据`);
    let userMini = await UserModel.find({urlToken: users[i].urlToken}).exec();

    if(userMini.length === 0) {
      await UserModel(users[i]).save();
      num++;
      console.log(` following ${users[i].urlToken} 的数据保存成功`);
    } else {
      console.log('\n');
      console.log(` following ${users[i].urlToken} 已经存在数据库`);
      console.log('\n');
    }
  }
  console.log('\n');
  console.log('\n');
  console.log('\n');
  console.log('\n');
  console.log(`此次增加 ${num} 个数据`);
  console.log('\n');
  console.log('\n');
  console.log('\n');
  console.log('\n');
  users = [];
  if(followingContinue) {
    followingPage += 1;
    console.log('folloeing url:', url);
    await setTimeout(()=>{console.log('继续抓取')}, 100);
    return setTimeout( async ()=>{
      await getFollowing(url);
    }, 100);
  }
}





function selectUserFollowers(html) {
  let user = [];

  const $ = cheerio.load(html);

  const data = JSON.parse($('#data').attr('data-state').toString());

  /*console.log(data);*/

  /*if(data.config.tip.includes('实名')) {
    followersContinue = false;
    startUser = {};
    return user;
  }*/

  let keys = Object.keys(data.entities.users);

  if(keys.length===0 ||(keys.length === 1 && keys.includes(START_USER))){
    console.log('\n');
    console.log('\n');
    console.log('\n');
    console.log('\n');
    console.log('只有本人');
    console.log('\n');
    console.log('\n');
    console.log('\n');
    console.log('\n');
    followersContinue = false;
    startUser = {};
    return user;
  }

  for(let key in data.entities.users) {
    let userData = data.entities.users[key];
    if(data.entities.users[key].urlToken === START_USER) {
      /*console.log(data.entities.users[key]);*/
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
      let item = {
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



function selectUserFollowing(html) {
  let user = [];

  const $ = cheerio.load(html);

  const data = JSON.parse($('#data').attr('data-state').toString());
  console.log(data);

  /*if(data.config.tip.includes('实名')) {
    console.log('\n');
    console.log('\n');
    console.log('\n');
    console.log('\n');
    console.log('\n');
    console.log('实名');
    console.log('\n');
    console.log('\n');
    console.log('\n');
    console.log('\n');
    console.log('\n');
    followingContinue = false;
    startUser = {};
    return user;
  }*/

  /*console.log(data);*/

  let keys = Object.keys(data.entities.users);

  /*console.log(keys);*/

  if(keys.length===0 ||(keys.length === 1 && keys.includes(START_USER))){
    console.log('\n');
    console.log('\n');
    console.log('\n');
    console.log('\n');
    console.log('只有本人');
    console.log('\n');
    console.log('\n');
    console.log('\n');
    console.log('\n');
    followingContinue = false;
    startUser = {};
    return user;
  }

  console.log(keys);
  for(let key in data.entities.users) {
    let userData = data.entities.users[key];
    if(data.entities.users[key].urlToken === START_USER) {
      /*console.log(data.entities.users[key]);*/
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
      let item = {
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




