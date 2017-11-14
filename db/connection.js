const mongoose = require('mongoose');
const db = require('./../config').db;
module.exports = async () => new Promise((resolve, reject) => {
  mongoose.connect(db, {
    userMongoClient: true
  }, (error) => {
    if (error) {
      (() => {
        console.log('fail to connect mongodb');
        resolve()
      })();
      reject(error.message);
    } else {
      (() => {
        console.log('success to connect mongodb');
        resolve()
      })()
    }
  })

});
