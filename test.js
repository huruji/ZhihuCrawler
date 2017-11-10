const mongoConnection = require('./db/numberConnection');
const UserModel = require('./db/numberSchema');
const request = require('superagent');
const cheerio = require('cheerio');
const spawn = require('child_process').spawnSync;
const path = require('path');
let skip = 0;

let child = spawn('node', [path.join(__dirname, 'question.js'), '20374985'], {
   stdio: "inherit"
});
