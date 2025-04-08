const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        minLength: 5,
        maxLength: 15,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minLength: 10,
        unique: true,
        lowercase: true,
    },
    email_verified_at: {
        type: Date,
        default: null
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 8,
    },
    phone_number: {
        type: String,
        default: null,
        trim: true,
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },
    bio: {
        type: String,
        default: null,
        trim: true,
    },
    followed: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    ],
    follower: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    ],
    favorites: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Category'
        }
    ],
    image_url: {
        type: String,
        default: null,
    },
    is_author: {
        type: Boolean,
        default: false,
    },
    is_suspended: {
        type: Boolean,
        default: false,
    },
    suspension_reason: {
        type: String,
        default: null,
        trim: true,
    },
}, { timestamps: true })

const model = mongoose.model('User', schema)

module.exports = model