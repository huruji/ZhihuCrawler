const spawn = require('child_process').spawn;
const log = console.log;
const path = require('path');

const mongoConnection = require('./../db/connection');


(async function(){
    await mongoConnection();
})();


log('1分钟后将开始完善用户信息\n');

log('2分钟后将开始爬取问题\n');

log('3分钟后将开始爬取主题、专栏、收藏夹\n');

log('4分钟后将开始爬取Live');

setTimeout( async() => {
    await require('./scripts/user.js')();
}, 1000 * 10);


setTimeout( async() => {
   await require('./scripts/perfectUser.js')();
}, 1000 * 60 * 1);

setTimeout(async() => {
    await require('./scripts/question.js')();
}, 1000 * 60 * 20);

setTimeout(async() => {
    await require('./scripts/topic.js')();
}, 1000 * 60 * 2);

setTimeout(async() => {
    await require('./scripts/column.js')();
}, 1000 * 60 * 3);

setTimeout(async() => {
    await require('./scripts/collection.js')();
}, 1000 * 60 * 3);

setTimeout(async() => {
    await require('./scripts/live.js')();
}, 1000 * 60 * 4);



