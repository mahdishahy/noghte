const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    categories: [{
        type: mongoose.Types.ObjectId,
        ref: "Category",
    }]
}, { timestamps: true });

const model = mongoose.model("Favorite", schema);

module.exports = model;