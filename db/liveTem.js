const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;

const temp = new Schema({
    title: {
        type: String,
        required: true
    },
    intro: {
        type: String
    },
    imageUrl: {
        type: String
    },
    id: {
        type: String
    },
    followers: {
        type: Number
    },
    articleCount: {
        type: Number
    },
    commentPermission: {
        type: String
    },
    url: {
        type: String
    },
    author: {
        type: Object
    },
    updated: {
        type: String
    },
    find_by_user: {
        type: String
    },
    create_time: Date,

});

module.exports = mongoose.model('Columns',column);