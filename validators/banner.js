const Validator = require("fastest-validator");

const v = new Validator();

const schema = {
    description: {
        type: "string",
        min: 1,
        trim: true,
        messages: {
            stringMin: "حداقل طول توضیحات باید ۱ کارکتر باشد"
        }
    },
    link: {
        type: "string",
        min: 3,
        trim: true,
        messages: {
            string: "لینک باید یک رشته باشد",
            stringMin: "حداقل طول لینک باید ۳ کارکتر باشد"
        }
    },
    status: {
        type: "string",
        enum: ["ENABLE", "DISABLE"],
        default: "ENABLE",
        messages: {
            enum: "وضعیت مجاز نیست . مقادیر مجاز : ENABLE , DISABLE"
        }
    },
    position: {
        type: "string",
        enum: ['1.1', '1.2', '1.3', '1.4', '2', '3', '4'],
        required: true,
        messages: {
            enum: "موقعیت مجاز نیست . مقادیر مجاز : 1.1, 1.2, 1.3, 1.4, 2, 3, 4"
        }
    },


}

const check = v.compile(schema);

module.exports = check;