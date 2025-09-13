const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minLength: 1,
    }
}, { timestamps: true });


const model = mongoose.model("Category", schema);

module.exports = model;