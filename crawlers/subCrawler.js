const mongoConnection = require('./../db/connection');
const crawlerName = process.argv[2];
const path = require('path');

console.log(crawlerName);

(async function init(){
    await mongoConnection();
    await require(path.join(__dirname,`scripts/${crawlerName}.js`))();
})();