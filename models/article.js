const { Schema, default: mongoose } = require("mongoose");
const slugify = require("slugify");
const { generateSlug } = require("../middlewares/article");

const schema = new Schema({
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
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    image_url: {
        type: String,
        default: null
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    collaborators: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    tags:
        [
            {
                type: Schema.Types.ObjectId,
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

const model = mongoose.model("Article", schema);

module.exports = model;