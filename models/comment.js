const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mainCommentId: {
        type: mongoose.Types.ObjectId,
        ref: 'Comment',
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: 'pending'
    }
}, { timestamps: true });

const model = mongoose.model('Comment', schema);

module.exports = model