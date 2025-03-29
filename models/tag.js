const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 15,
        unique: true
    }
}, { timestamps: true })

const model = mongoose.model('Tag', schema)

module.exports = model