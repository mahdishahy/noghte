const Validator = require('fastest-validator')

const v = new Validator()

const schema = {
    full_name: {
        type: 'string',
        min: 3,
        trim: true,
        messages: {
            required: 'نام و نام خانوادگی الزامی است',
            stringMin: 'نام کامل حداقل باید 3 کاراکتر باشد'
        }
    },
    username: {
        type: 'string',
        trim: true,
        pattern: /^[a-zA-Z0-9_]+$/,
        messages: {
            required: 'نام کاربری الزامی است',
            stringMin: 'نام کاربری حداقل باید 5 کاراکتر باشد',
            stringMax: 'نام کاربری حداکثر باید 15 کاراکتر باشد',
            stringPattern: 'نام کاربری فقط می تواند حاوی حروف، اعداد و زیرخط باشد'
        }
    },
    email: {
        type: 'email',
        normalize: true,
        messages: {
            required: "ایمیل الزامی است",
            email: "ایمیل نامعتبر است."
        }
    },
    phone_number: {
        type: 'string',
        optional: true,
    },
    password: {
        type: 'string',
        min: 8,
        messages: {
            required: "رمز عبور الزامی است",
            stringMin: "رمز عبور حداقل باید 8 کاراکتر باشد"
        }
    },
    confirm_password: {
        type: "equal",
        field: "password",
        messages: {
            equalField: 'رمز عبور مطابقت ندارد'
        }
    },
    $$strict: true
}

const check = v.compile(schema)

module.exports = check