const mongoConnection = require('./db/numberConnection');
const QuestionModel = require('./db/questionSchema');
const request = require('superagent');
const cheerio = require('cheerio');

const id = process.argv[2];
const url = `https://www.zhihu.com/question/${id}`;

async function getInfo() {
  return request.get(url).then(res => res.text);
}

async function write(html, token) {
  console.log('获取到了问题页面');
  let $ = cheerio.load(html);
  let data = $('#data').attr('data-state');
  if(!data) {
    return;
  }
  let jsonData = JSON.parse(data.toString());
  let question = jsonData.entities.questions[id];
  console.log('\n');
  console.log(`开始保存问题 ${id} ${question.title} `);
  await QuestionModel(question).save();
  console.log(`问题 ${id} ${question.title} 保存完成`);
  console.log('\n');
  return;
}

async function init() {
  await mongoConnection();
  const db = await QuestionModel.find({id: id}).exec();
  if(db.length > 0) {
    console.log(`问题 ${id} ${db[0].title} 已经存在数据库中`);
    console.log('\n')
    return 0;
  }
  const html = await getInfo();
  await write(html);
  return 0;
}
init().then(() => process.exit(0));