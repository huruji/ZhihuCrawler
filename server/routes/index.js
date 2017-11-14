const router = require('koa-router')();
const UserModel = require('./../../db/user');
const QuestionModel = require('./../../db/question');
const TopicModel = require('./../../db/topic');
const CollectionModel = require('./../../db/collection');
const ColumnModel = require('./../../db/column');
const LiveModel = require('./../../db/live');
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
    url: ctx.request.path
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
    url: ctx.request.path
  })
});

router.get('/questions', async (ctx, next) => {
    const page = (ctx.request.query.page - 1) || 0;
    const data = await QuestionModel.find({}, null, {limit: 100, skip: page * 100}).exec();
    let countData = await QuestionModel.count().exec();
    let count = Math.ceil(countData / 100);
    let start = (page * 100) + 1;
    await ctx.render('question', {
        data,
        count,
        start,
        page: page + 1,
        url: ctx.request.path
    })
});

router.get('/collections', async (ctx, next) => {
    const page = (ctx.request.query.page - 1) || 0;
    const data = await CollectionModel.find({}, null, {limit: 100, skip: page * 100}).exec();
    let countData = await CollectionModel.count().exec();
    let count = Math.ceil(countData / 100);
    let start = (page * 100) + 1;
    await ctx.render('collection', {
        data,
        count,
        start,
        page: page + 1,
        url: ctx.request.path
    })
});

router.get('/columns', async (ctx, next) => {
    const page = (ctx.request.query.page - 1) || 0;
    const data = await ColumnModel.find({}, null, {limit: 100, skip: page * 100}).exec();
    let countData = await ColumnModel.count().exec();
    let count = Math.ceil(countData / 100);
    let start = (page * 100) + 1;
    await ctx.render('column', {
        data,
        count,
        start,
        page: page + 1,
        url: ctx.request.path
    })
});

router.get('/lives', async (ctx, next) => {
    const page = (ctx.request.query.page - 1) || 0;
    const data = await LiveModel.find({}, null, {limit: 100, skip: page * 100}).exec();
    let countData = await LiveModel.count().exec();
    let count = Math.ceil(countData / 100);
    let start = (page * 100) + 1;
    await ctx.render('live', {
        data,
        count,
        start,
        page: page + 1,
        url: ctx.request.path
    })
});

router.get('/getimg/*/:id', async (ctx, next) => {
  await getImg(ctx,next);
});
router.get('/getimg/:id', async (ctx, next) => {
    await getImg(ctx,next);
});

async function getImg(ctx, next) {
    const id = ctx.params.id.replace(/_[a-zA-Z]+/, '_xll');
    console.log('id',id);
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
}

module.exports = router;