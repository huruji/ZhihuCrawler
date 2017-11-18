const spawn = require('child_process').spawn;
const log = console.log;
const chalk = require('chalk');
const path = require('path');


log('-------------------开启web服务器进程-------------------');

const server = spawn('node', ['--harmony','server.js'], {
    cwd: path.join(__dirname, 'server'),
    stdio: 'inherit'
});

server.on('error', function(err) {
    log(err);
    log('服务器进程开启遇到错误');
    process.exit();
});

log('-------------------开启爬虫进程-------------------');

let crawler = spawn('node', ['--harmony', 'index.js'], {
    cwd: path.join(__dirname, 'crawlers'),
    stdio: 'inherit'
});

crawler.on('error', function(err) {
    log(err);
    log('爬虫进程开启遇到错误');
    process.exit();
});

