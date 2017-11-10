const Koa = require('koa');
const mongoConnection = require('./../db/numberConnection');
const ejs = require('ejs');
const views = require('koa-views');
const path = require('path');
const router = require('koa-router');

const app = new Koa();

app.use(views(path.join(__dirname, 'views'), {
  extension: 'ejs'
}));

app.use(require('./routes/index.js').routes());

mongoConnection();


app.listen(3044, () => {
  console.log('开始监听 3044 端口');
});