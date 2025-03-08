const Validateor = require("fastest-validator");
const { ObjectID } = require("mongodb");
const v = new Validateor();

const schema = {
    title: {
        type: "string",
        min: 1,
        trim: true,
        messages: {
            required: "عنوان مقاله الزامی است",
            stringMin: "حداقل طول عنوان باید ۱ کارکتر باشد"
        }
    },
    content: {
        type: "string",
        min: 10,
        trim: true,
        messages: {
            required: "محتوای مقاله الزامی است",
            stringMin: "حداقل طول محتوا باید ۱۰ کارکتر باشد"
        }
    },
    slug: {
        type: "forbidden",
        message: {
            forbidden: "امکان تغییر slug وجود ندارد"
        }
    },
    image_url: {
        type: "string",
        optional: null,
        messages: {
            string: "آدرس عکس باید یک رشته باشد"
        }
    },
    owner: {
        type: "string",
        custom: (value, errors) => {
            if (!ObjectID.isValid(value)) {
                errors.push({ type: "objectID", expected: "a valid objectID", actual: value });
            }
            return value;
        },
        messages: {
            required: "صاحب مقاله الزامی است",
            objectID: "شناسه صاحب مقاله الزامی است"
        }
    },
    collaborators: {
        type: "array",
        optional: true,
        items: {
            type: "string",
            custom: (value, errors) => {
                if (!ObjectID.isValid(value)) {
                    errors.push({ type: "objectID", expected: "a valid objectID", actual: value });
                }
                return value;
            },
            message: {
                objectID: "شناسه همکار معتبر نیست"
            }
        }
    },
    tags: {
        type: "array",
        optional: true,
        items: {
            type: "string",
            custom: (value, errors) => {
                if (!ObjectID.isValid(value)) {
                    errors.push({ type: "objectID", expected: "a valid objectID", actual: value });
                }
                return value;
            },
            messages: {
                objectID: "شناسه تگ معتبر نیست"
            }
        }
    },
    status: {
        type: "string",
        enum: ["DRAFT", "PUBLISHED", "PENDING"],
        default: "PENDING",
        messages: {
            enum: "وضعیت مجاز نیست . مقادیر مجاز : DRAFT, PUBLISHED, PENDING"
        }
    }

}

const check = v.compile(schema);

module.exports = check;