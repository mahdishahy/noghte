const userModel = require("./../../models/user");
const registerValidator = require("./../../validators/register");
const passwordUtils = require('./../../utils/password')
const { generateTokens, verifyRefreshToken } = require('../../utils/getToken')

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

        const user = await userModel?.findOne({
            $or: [{ username }, { email }, { phone_number }],
        });

        // check user suspension
        if ( user?.is_suspended ) {
            return res.status(403).json({
                message: 'حساب شما تعلیق شده است',
                reason: `علت تعلیق: ${ user.suspension_reason }`
            })
        }

        // checking if the user is registered
        if ( user ) {
            return res.status(409).json({
                message:
                    "کاربری با این ایمیل، شماره تلفن یا نام کاربری از قبل وجود داره"
            });
        }

        // checking count of user
        const countOfUser = await userModel.countDocuments();

        // hash password
        const hashedPassword = await passwordUtils.hash(password)

        // new user
        const newUser = await userModel.create({
            full_name,
            username,
            email,
            phone_number,
            password: hashedPassword,
            role: countOfUser > 0 ? "USER" : "ADMIN",
            refresh_token: null
        });

        // convert user into object and remove password key
        const userObject = passwordUtils.removeOnePropertyInObject(newUser, 'password');

        // generate access token
        const { accessToken, refreshToken } = generateTokens(newUser)

        // set refresh token
        newUser.refresh_token = refreshToken
        await newUser.save()

        return res.status(201).json({
            message: 'ثبت نام با موفقیت انجام شد',
            user: userObject,
            accessToken,
            refreshToken
        });
    } catch ( error ) {
        return res.status(500).json({ message: "خطای سرور" });
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
        if ( !passwordUtils.isValidPassword(password, user.password) ) {
            return res
                .status(403)
                .json({ message: "ایمیل و رمزعبور صحیح نمی باشد" });
        }

        // convert user into object and remove password key
        const userObject = passwordUtils.removeOnePropertyInObject(user, 'password');

        // generate access token
        const { accessToken, refreshToken } = generateTokens(user)

        // set refresh token
        user.refresh_token = refreshToken
        await user.save()

        return res.status(200).json({ user: userObject, accessToken });
    } catch ( error ) {
        return res.status(500).json({ message: "خطای سرور" });
    }
};

exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body

    if ( !refreshToken ) {
        return res.status(400).json({
            message: 'توکن رفرش الزامی است'
        });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if ( !decoded ) {
        return res.status(403).json({
            message: 'توکن رفرش نا معتبر یا منقضی شده '
        });
    }

    try {
        const user = await userModel.findOne({ refresh_token: refreshToken });
        if ( !user ) {
            return res.status(404).json({
                message: 'کاربر پیدا نشد'
            });
        }

        if ( user.refresh_token !== refreshToken ) {
            return res.status(403).json({
                message: 'توکن رفرش برای این کاربر معتبر نمی باشد'
            });
        }

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

        user.refreshToken = newRefreshToken;
        await user.save();

        return res.json({
            message: 'توکن‌ها با موفقیت بروزرسانی شدند',
            accessToken,
            refreshToken: newRefreshToken
        });
    } catch ( error ) {
        return res.status(500).json({ message: "خطای سرور" });
    }
};


// const tokens = {
//     accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODVlY2IwZjVlNWRjNzBmMDI1MGQ3ZWQiLCJlbWFpbCI6ImFueWFfYm9laG01MkB5YWhvby5jb20iLCJpYXQiOjE3NTEwNDI4MzEsImV4cCI6MTc1MTA0MzczMX0.9mIMEX1haVBuX8lj94hf3MP-DwSLwWWj2AhlYGNTudc",
//     refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODVlY2IwZjVlNWRjNzBmMDI1MGQ3ZWQiLCJlbWFpbCI6ImFueWFfYm9laG01MkB5YWhvby5jb20iLCJpYXQiOjE3NTEwNDI4MzEsImV4cCI6MTc1MzYzNDgzMX0.9eisGge_okIM2bjWrf-WYX4OT3K4mDR34chZ5Ex0eDk"
// }