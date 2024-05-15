const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    route: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    },
    count: {
        type: Number,
        default: 0,
    }
});

schema.index({ route: 1, date: 1 }, { unique: true });

module.exports = mongoose.model(
    'Views',
    schema
);