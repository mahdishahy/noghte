const mongoose = require('mongoose')
const slugify = require("slugify");
const { generateSlug } = require("../middlewares/article");

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minLength: 1,
    },
    content: {
        type: String,
        required: true,
        trim: true,
        minLength: 10
    },
    likes: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User",
        }
    ],
    slug: {
        type: String,
        unique: true,
    },
    image_url: {
        type: String,
        default: null
    },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    category: {
        type: mongoose.Types.ObjectId,
        ref: "Category",
    },
    collaborators: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User"
        }
    ],
    tags:
        [
            {
                type: mongoose.Types.ObjectId,
                ref: "Tag",
                default: null
            }
        ],
    status: {
        type: String,
        enum: ["DRAFT", "PUBLISHED", "PENDING"],
        default: "PENDING"
    },
}, { timestamps: true });

schema.pre("save", generateSlug);

schema.virtual('comments', {
    ref: 'Comment',
    foreignField: 'article',
    localField: '_id',
})

const model = mongoose.model("Article", schema);

module.exports = model;