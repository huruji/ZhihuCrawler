const mongoConnection = require('./db/numberConnection');
const UserModel = require('./db/numberSchema');
const request = require('superagent');
const cheerio = require('cheerio');
const spawn = require('child_process').spawnSync;
const path = require('path');
const fs = require('fs');
let skip = 60000;
async function getUser() {
  let user = UserModel.findOne({'columnsCount': {$exists: false}}).skip(skip).exec();
  return user;
}

async function getInfo(token) {
  let url = `https://www.zhihu.com/people/${token}`;
  return request.get(url).then(res => res.text);
}

async function write(html, token) {
	skip++;
  console.log(`获取到了用户 ${token} 页面`);
  let $ = cheerio.load(html);
  let data = $('#data').attr('data-state');
  console.log('获取到了data');
  if(!data) {
    console.log(`用户 ${token} 数据不存在`);
    skip++;
    return await start();
  }
  console.log(data);
  data = JSON.parse(data.toString());
  console.log('\n');
  /*console.log(data.entities.users);*/
  if(Object.keys(data.entities.users).length === 0) {
    setTimeout(function() {
      start()
    }, 600000);
    return;
  }
  if(data.entities.users[token]) {
    let user = data.entities.users[token];
    console.log('\n');
    console.log(`开始更新用户 ${token} 的数据`);
    await UserModel.update({urlToken: token},user).exec().then(()=>{},(err)=>{
      console.log(err);
    });
    console.log(`用户 ${token} 的数据更新完成`);
    console.log('\n');
  }
  if(!data.entities.questions){
    skip++;
    return;
  }
  /*if(Object.keys(data.entities.questions).length >0) {
    console.log('有关注的问题1111');
    for(let key in data.entities.questions) {
      let child = spawn('node', [path.join(__dirname, 'question.js'), data.entities.questions[key].id], {
        stdio: "inherit"
      });
    }
  }*/
  skip++;
  start();
}

(async function init() {
  await mongoConnection();
  start();
})();

function start () {
  (async() => {
    let users = await getUser();
    /*for(let i = 0; i < users.length; i++) {
     let url = 'https://www.zhihu.com/people/' + users[i].urlToken + '/activities';
     let html = await request.get(url).set('Referer', `https://www.zhihu.com/people/${users[i].urlToken}/following`).then(res => {
     return res.text});
     await write(html, users[i].urlToken);
     }*/
    console.log(users.urlToken);
    let url = 'https://www.zhihu.com/people/' + users.urlToken + '/activities';
    let html = await request.get(url).set('Referer', `https://www.zhihu.com/people/${users.urlToken}/following`).then(res => {
      console.log('success');
      return res.text},(err)=>{
      console.log('errrrrrrrrrr');
      skip++;
      start();
    });

    await write(html, users.urlToken);
    return 0;
  })()
}


