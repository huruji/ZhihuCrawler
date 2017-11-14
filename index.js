const spawn = require('child_process').spawn;
const log = console.log;
const chalk = require('chalk');
const path = require('path');


log('-------------------开启web服务器进程-------------------');

const server = spawn('node', ['--harmony','server.js'], {
    cwd: path.join(__dirname, 'server'),
    stdio: 'inherit'
});


log('-------------------开启爬虫进程-------------------');

const crawler = spawn('node', ['--harmony', 'user.js'], {
    cwd: path.join(__dirname, 'crawlers'),
    stdio: 'inherit'
});

