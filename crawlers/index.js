const spawn = require('child_process').spawn;
const log = console.log;
const path = require('path');

let perfect, live, column, collection, topic, question;


const user = spawn('node', ['user.js'], {
    cwd: __dirname,
    stdio: 'inherit'
});

user.on('error', function(err) {
    log(err);
    log('进程开启遇到错误');
    process.exit();
});

log('10分钟后将开始完善用户信息\n');

log('20分钟后将开始爬取问题\n');

log('30分钟后将开始爬取主题、专栏、收藏夹\n');

log('40分钟后将开始爬取Live');




setTimeout(() => {
    startPerfect();
}, 1000 * 60 * 10);

/*setTimeout(() => {
    startQuestion();
}, 1000 * 60 * 20);*/

setTimeout(() => {
    startTopic();
}, 1000 * 60 * 20);

setTimeout(() => {
    startColumn();
}, 1000 * 60 * 30);

setTimeout(() => {
    startCollection();
}, 1000 * 60 * 30);

setTimeout(() => {
    startLive();
}, 1000 * 60 * 40);


function startQuestion() {
    log('---------------开启完善用户信息进程---------------');
    perfect = spawn('node', ['--harmony', 'question.js'], {
        cwd: __dirname,
        stdio: 'inherit'
    });
}

function startPerfect() {
    log('---------------开启完善用户信息进程---------------');
    perfect = spawn('node', ['--harmony', 'perfectUser.js'], {
        cwd: __dirname,
        stdio: 'inherit'
    });
}

function startLive() {
    log('---------------开启Live进程---------------');
    perfect = spawn('node', ['--harmony', 'live.js'], {
        cwd: __dirname,
        stdio: 'inherit'
    });
}

function startColumn() {
    log('---------------开启专栏进程---------------');
    perfect = spawn('node', ['--harmony', 'column.js'], {
        cwd: __dirname,
        stdio: 'inherit'
    });
}

function startCollection() {
    log('---------------开启专栏进程---------------');
    perfect = spawn('node', ['--harmony', 'collection.js'], {
        cwd: __dirname,
        stdio: 'inherit'
    });
}

function startTopic() {
    log('---------------开启专栏进程---------------');
    perfect = spawn('node', ['--harmony', 'topic.js'], {
        cwd: __dirname,
        stdio: 'inherit'
    });
}
