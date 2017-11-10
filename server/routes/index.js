const router = require('koa-router')();
const UserModel = require('./../../db/numberSchema');

router.get('/', async (ctx, next) => {
  const page = (ctx.request.query.page - 1) || 0;

  const data = await UserModel.find({}, null, {limit: 1000, skip: page * 1000}).exec();
  let countData = await UserModel.count().exec();
  let count = Math.ceil(countData / 1000);

  let start = (page * 1000) + 1;
  await ctx.render('index', {
    data,
    count,
    start
  })
});

module.exports = router;