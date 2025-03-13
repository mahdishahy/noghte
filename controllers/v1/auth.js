const userModel = require("./../../models/user");
const registerValidator = require("./../../validators/register");
const bcrypt = require("bcrypt");
const { generateAccessToken } = require('../../utils/getToken')

exports.register = async (req, res) => {
    try {
        // Data validation
        const validationResult = registerValidator(req.body);
        if ( validationResult !== true ) {
            return res
                .status(422)
                .json({ message: "خطای اعتبارسنجی", error: validationResult });
        }

        // receive data from request body
        const { full_name, username, email, phone_number, password } = req.body;

        const user = await userModel.findOne({
            $or: [{ username }, { email }, { phone_number }],
        });

        // check user suspension
        if ( user.is_suspended ) {
            return res.status(403).json({
                message: 'حساب شما تعلیق شده است',
                reason: `علت تعلیق: ${ user.suspension_reason }`
            })
        }

        // checking if the user is registered
        if ( user ) {
            return res.status(409).json({
                message:
                    "کاربری با این ایمیل، شماره تلفن یا نام کاربری از قبل وجود داره",
            });
        }

        // checking count of user
        const countOfUser = await userModel.countDocuments();

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // new user
        const newUser = await userModel.create({
            full_name,
            username,
            email,
            phone_number,
            password: hashedPassword,
            role: countOfUser > 0 ? "USER" : "ADMIN",
        });

        // convert user into object
        const userObject = newUser.toObject();
        // delete password field
        Reflect.deleteProperty(userObject, "password");

        // generate access token
        const accessToken = generateAccessToken(newUser.Id)

        return res.status(201).json({ user: userObject, accessToken });
    } catch ( error ) {
        return res.status(500).json({ message: "خطای سرور", error });
    }
};

exports.login = async (req, res) => {
    try {
        // receive data from request body
        const { identifier, password } = req.body;

        // find user by identifier
        const user = await userModel.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        });

        // check user
        if ( !user ) {
            return res
                .status(404)
                .json({ message: "کاربری با این مشخصات یافت نشد" });
        }

        // check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if ( !isPasswordValid ) {
            return res
                .status(403)
                .json({ message: "کاربری با این نام کاربری یا پسورد یافت نشد" });
        }

        // convert user into object
        const userObject = user.toObject();
        // delete password field
        Reflect.deleteProperty(userObject, "password");

        // generate access token
        const accessToken = generateAccessToken(user.Id)

        return res.status(201).json({ user: userObject, accessToken });
    } catch ( error ) {
        return res.status(500).json({ message: "خطای سرور" });
    }
};

exports.getMe = async (req, res) => {
};
