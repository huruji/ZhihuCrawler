const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;

const collection = new Schema({
    title: {
        type: String,
        required: true
    },
    url: {
        type: String,
    },
    answerCount: {
        type: String
    },
    updateTime: {
        type: String
    },
    followerCount: {
        type: String
    },
    isPublic: {
        type: Boolean
    },
    id: {
        type: String
    },
    find_by_user: {
        type: String
    },
    create_time: Date,

});

module.exports = mongoose.model('Collections',collection);