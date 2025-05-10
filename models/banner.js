const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    file: {
        type: String,
        required: true,
        default: null
    },
    description: {
        type: String,
        trim: true,
        minLength: 1,
        optional: true
    },
    link: {
        type: String,
        optional: true,
        trim: true,
        minLength: 3
    },
    position: {
        type: String,
        required: true,
        enum: ['1.1', '1.2', '1.3', '1.4', '2', '3', '4'],
    },
    status: {
        type: String,
        enum: ["ENABLE", "DISABLE"],
        default: "PENDING"
    },
}, { timestamps: true });


const model = mongoose.model("Banner", schema);

module.exports = model;