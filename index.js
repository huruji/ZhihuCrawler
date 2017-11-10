const request = require('superagent');
const cheerio = require('cheerio');
const merge = require('utils-merge');

const mongoConnection = require('./db/connection');
const UserModel = require('./db/schema');


const CONFIG_USER = require('./config').user;

let START_USER = CONFIG_USER[Math.floor(Math.random() * CONFIG_USER.length)];

let INIT_USER = START_USER;

let followingContinue = true;
let followersContinue = true;
let followingPage = 1;
let followersPage = 1;

let urls = {
  index: `https://www.zhihu.com/people/${START_USER}/activities`,
  following: `https://www.zhihu.com/people/${START_USER}/following`,
  followers: `https://www.zhihu.com/people/${START_USER}/followers`
};
let user = {};

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

  user.token = START_USER;

  console.log('抓取首页');

  (async function getIndex(urls) {

    const html = await request.get(urls.index)
      .then(res => res.text).catch(err => {
        START_USER = CONFIG_USER[Math.floor(Math.random() * CONFIG_USER.length)];
        urls = {
          index: `https://www.zhihu.com/people/${START_USER}/activities`,
          following: `https://www.zhihu.com/people/${START_USER}/following`,
          followers: `https://www.zhihu.com/people/${START_USER}/followers`
        };
        getUserInfo(urls)
      });

    let userIndex = selectUserIndex(html);

    user = merge(user, userIndex);
    user.following = [];
    user.followers = [];

    console.log(user.avatar);

    console.log('抓取followings');
    await getFollowing(urls.following);




    console.log('抓取followers');
    await getFollowers(urls.followers);

    console.log('\n');
    console.log(`用户 ${START_USER} 共关注了 ${user.following.length} 个用户 `);
    console.log(`用户 ${START_USER} 共被 ${user.followers.length} 个人关注 `);
    console.log('\n');

    console.log(`开始保存用户 ${START_USER} 的数据`);
    await UserModel(user).save();
    console.log(`用户 ${START_USER} 的数据保存成功`);
    if(user.followers.length) {
      await continueFollowers();
    }else if(user.following.length > 0) {
      await continueFollowing()
    }
  })(urls);


}


async function continueFollowers() {
  console.log(`继续抓取 ${START_USER} 的followers用户的数据`);
  const index = Math.floor(Math.random() * user.followers.length);
  START_USER = user.followers[index].token;
  const databaseUser = await UserModel.findOne({token: START_USER});
  if(databaseUser) {
    console.log(`用户 ${START_USER} 已经存在数据库`);
    return continueFollowers();
  }
  followingContinue = true;
  followersContinue = true;
  followingPage = 1;
  followersPage = 1;
  urls = {
    index: `https://www.zhihu.com/people/${START_USER}/activities`,
    following: `https://www.zhihu.com/people/${START_USER}/following`,
    followers: `https://www.zhihu.com/people/${START_USER}/followers`
  };

  user = {};

  getUserInfo(urls);
}

async function continueFollowing() {
  console.log('\n');
  console.log(`继续抓取 ${START_USER} 的following用户的数据`);

  const index = Math.floor(Math.random() * user.following.length);
  START_USER = user.following[index].token;
  const databaseUser = await UserModel.findOne({token: START_USER});
  if(databaseUser) {
    console.log('\n');
    console.log(`用户 ${START_USER} 已经存在数据库`);
    console.log('\n');
    return continueFollowing();
  }

  urls = {
    index: `https://www.zhihu.com/people/${START_USER}/activities`,
    following: `https://www.zhihu.com/people/${START_USER}/following`,
    followers: `https://www.zhihu.com/people/${START_USER}/followers`
  };

  followingContinue = true;
  followersContinue = true;
  followingPage = 1;
  followersPage = 1;

  user = {};
  getUserInfo(urls);
}

async function getFollowing(url) {

  let manageUrl = `${url}?page=${followingPage}`;

  console.log('抓取following页面：',manageUrl);
  const html = await request.get(manageUrl).then(res => res.text).catch(err => {
    if(err) {
      setTimeout(function(){
        if(user.following.length > 0) {
          const index = Math.floor(Math.random() * user.following.length);
          START_USER = user.following[index].token;
        } else if (user.followers.length > 0) {
          const index = Math.floor(Math.random() * user.followers.length);
          START_USER = user.followers[index].token;
        } else {
          START_USER = CONFIG_USER[13]
        }
        urls = {
          index: `https://www.zhihu.com/people/${START_USER}/activities`,
          following: `https://www.zhihu.com/people/${START_USER}/following`,
          followers: `https://www.zhihu.com/people/${START_USER}/followers`
        };

        followingContinue = true;
        followersContinue = true;
        followingPage = 1;
        followersPage = 1;
        getUserInfo(urls);
      }, 5000);
    }
  });

  const userFollowing = selectUserFollowing(html);

  Array.prototype.push.apply(user.following,userFollowing);

  if(followingContinue) {
    followingPage += 1;
    console.log('folloeing url:', url);
    await setTimeout(()=>{console.log('继续抓取')}, 100);
    return getFollowing(url);
  }
}

async function getFollowers(url) {

  let manageUrl = `${url}?page=${followersPage}`;

  console.log('抓取followers页面：',manageUrl);

  const html = await request.get(manageUrl).then(res => res.text).catch(err => {
    if(err) {
      setTimeout(function(){
        if(user.following.length > 0) {
          const index = Math.floor(Math.random() * user.following.length);
          START_USER = user.following[index].token;
        } else if (user.followers.length > 0) {
          const index = Math.floor(Math.random() * user.followers.length);
          START_USER = user.followers[index].token;
        } else {
          START_USER = CONFIG_USER[13]
        }
        urls = {
          index: `https://www.zhihu.com/people/${START_USER}/activities`,
          following: `https://www.zhihu.com/people/${START_USER}/following`,
          followers: `https://www.zhihu.com/people/${START_USER}/followers`
        };

        followingContinue = true;
        followersContinue = true;
        followingPage = 1;
        followersPage = 1;
        getUserInfo(urls);
      }, 5000);
    }
  });

  const userFollowers = selectUserFollowers(html);

  Array.prototype.push.apply(user.followers,userFollowers);

  if(followersContinue) {
    followersPage += 1;
    await setTimeout(()=>{console.log('继续抓取')}, 100);
    return getFollowers(url);
  }
}



function selectUserFollowers(html) {
  let user = [];

  const $ = cheerio.load(html);

  const data = JSON.parse($('#data').attr('data-state').toString());

  /*console.log(data);*/

  let keys = Object.keys(data.entities.users);

  if(keys.length===0 ||(keys.length === 1 && keys.includes(START_USER))){
    followersContinue = false;
  }

  for(let key in data.entities.users) {

    if(data.entities.users[key].urlToken === START_USER) {
      continue;
    }

    let item = {};
    item.token = data.entities.users[key].urlToken;
    item.name = data.entities.users[key].name;
    user.push(item);
  }
  return user;
}



function selectUserFollowing(html) {
  let user = [];

  const $ = cheerio.load(html);

  const data = JSON.parse($('#data').attr('data-state').toString());

  /*console.log(data);*/

  let keys = Object.keys(data.entities.users);

  /*console.log(keys);*/

  if(keys.length===0 ||(keys.length === 1 && keys.includes(START_USER))){
    console.log(1111111);
    followingContinue = false;
  }

  for(let key in data.entities.users) {

    if(data.entities.users[key].urlToken === START_USER) {
      continue;
    }

    let item = {};
    item.token = data.entities.users[key].urlToken;
    item.name = data.entities.users[key].name;
    user.push(item);
  }
  return user;
}




function selectUserIndex(html) {
  let user = {};
  const $ = cheerio.load(html);

  user.name = $('.ProfileHeader-name').text();

  user.signature = $('.ProfileHeader-headline').text();

  user.avatar = $('.ProfileHeader-avatar').find('img').attr('src');

  if(html.includes('Icon--male')) {
    user.sex = 'male';
  } else if(html.includes('Icon--female')) {
    user.sex = 'female';
  } else {
    user.sex = 'secret';
  }

  return user
  /*if(html.includes('FollowshipCard')) {
   $('.FollowshipCard').find('.NumberBoard-value').each(function(i, ele) {
   if(i === 0) {
   user.following = $(this).text();
   } else if(i === 1) {
   user.followers = $(this).text();
   }
   })
   }*/

}