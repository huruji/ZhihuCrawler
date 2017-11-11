const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;

const live = new Schema({
    subject: {
        type: String,
        required: true
    },
    score: {
        type: Number
    },
    speaker: {
        type: Object
    },
    tags: {
        type: Array
    },
    fee: {
        type: Number
    },
    id: {
        type: String
    },
    reviewCount: {
        type: Number
    },
    seats: {
        type: Number
    },
    status: {
        type: String
    }
});

module.exports = mongoose.model('Lives',live);