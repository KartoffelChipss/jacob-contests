const mongoose = require('mongoose');

module.exports = mongoose.model(
    'Views',
    new mongoose.Schema({
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
    })
);