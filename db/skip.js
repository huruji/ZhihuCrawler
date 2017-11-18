const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;

const skip = new Schema({
    topicSkip: {
        type: Number,
        default: 1,
    },
    columnSkip: {
        type: Number,
        default: 1,
    },
    collectionSkip: {
        type: Number,
        default: 1,
    },
    liveSkip: {
        type: Number,
        default: 1,
    },
    questionSkip: {
        type: Number,
        default: 1,
    }
});

module.exports = mongoose.model('Skips',skip);