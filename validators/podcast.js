const Validator = require("fastest-validator");

const v = new Validator();

const schema = {
    title: {
        type: "string",
        min: 1,
        trim: true,
        messages: {
            required: "عنوان پادکست الزامی است",
            stringMin: "حداقل طول عنوان باید ۱ کارکتر باشد"
        }
    },
    podcast_sound: {
        type: "string",
        min: 1,
        trim: true,
        messages: {
            required: "آدرس پادکست الزامی است",
            stringMin: "حداقل طول آدرس باید ۱ کارکتر باشد"
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
    status: {
        type: "string",
        enum: ["DRAFT", "PUBLISHED", "PENDING"],
        default: "PENDING",
        messages: {
            enum: "وضعیت مجاز نیست . مقادیر مجاز : DRAFT, PUBLISHED, PENDING"
        }
    },
    category: {
        type: "string",
        messages: {
            required: "دسته بندی برای پادکست الزامی است",
        }
    }

}

const check = v.compile(schema);

module.exports = check;