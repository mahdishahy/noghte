const Validator = require("fastest-validator");

const v = new Validator();

const schema = {
    title: {
        type: "string",
        min: 1,
        trim: true,
        messages: {
            required: "عنوان دسته بندی الزامی است",
            stringMin: "حداقل طول دسته بندی باید ۱ کارکتر باشد"
        }
    },
}

const check = v.compile(schema);

module.exports = check;