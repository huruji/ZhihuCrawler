const router = require('koa-router')();
const UserModel = require('./../../db/numberSchema');
const TopicModel = require('./../../db/topic');
const request = require('superagent');

let page, start, url;

router.get('/', async (ctx, next) => {
  const page = (ctx.request.query.page - 1) || 0;

  const data = await UserModel.find({}, null, {limit: 100, skip: page * 100}).exec();
  let countData = await UserModel.count().exec();
  let count = Math.ceil(countData / 100);

  let start = (page * 100) + 1;
  await ctx.render('index', {
    data,
    count,
    start,
    page: page + 1,
    url: '/'
  })
});

router.get('/topics', async (ctx, next) => {
  const page = (ctx.request.query.page - 1) || 0;
  const data = await TopicModel.find({}, null, {limit: 100, skip: page * 100}).exec();
  let countData = await TopicModel.count().exec();
  let count = Math.ceil(countData / 100);

  let start = (page * 100) + 1;
  await ctx.render('topic', {
    data,
    count,
    start,
    page: page + 1,
    url: '/topics'
  })
});

router.get('/getimg/:id', async (ctx, next) => {
  const id = ctx.params.id.replace(/_[a-zA-Z]+/, '_xll');
  const url = `https://pic1.zhimg.com/${id}`;
  let {header, data} = await request.get(url)
      .set("referrer", 'https://www.zhihu.com/')
      .then((res) => {
        return{
          header: res.headers,
          data: res.body
        }
      });
  for(let key in header) {
    ctx.set(key, header[key]);
  }
  ctx.response.body=data;
});

module.exports = router;