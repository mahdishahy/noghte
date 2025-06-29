const userModel = require("./../../models/user");
const registerValidator = require("./../../validators/register");
const passwordUtils = require('./../../utils/password')
const { generateTokens, verifyRefreshToken } = require('../../utils/getToken')
const AppError = require('./../../utils/AppError');
const { StatusCodes } = require('http-status-codes');

exports.register = async (req, res) => {
    // Data validation
    const validationResult = registerValidator(req.body);
    if ( validationResult !== true ) {
        return next(new AppError("خطای اعتبارسنجی", StatusCodes.UNPROCESSABLE_ENTITY, validationResult));
    }

    // receive data from request body
    const { full_name, username, email, phone_number, password } = req.body;

    const user = await userModel?.findOne({
        $or: [{ username }, { email }, { phone_number }],
    });

    // check user suspension
    if ( user?.is_suspended ) {
        return next(new AppError(`حساب شما به دلیل ${ user.suspension_reason } تعلیق شده است.`, StatusCodes.FORBIDDEN));
    }

    // checking if the user is registered
    if ( user ) {
        return next(new AppError("کاربری با این ایمیل، شماره تلفن یا نام کاربری از قبل وجود دارد", StatusCodes.CONFLICT));
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

    return res.status(StatusCodes.CREATED).json({
        message: 'ثبت نام با موفقیت انجام شد',
        user: userObject,
        accessToken,
        refreshToken
    });
};

exports.login = async (req, res, next) => {
    // receive data from request body
    const { identifier, password } = req.body;

    // find user by identifier
    const user = await userModel.findOne({
        $or: [{ email: identifier }, { username: identifier }]
    });

    // check user and check password
    if ( !user || !passwordUtils.isValidPassword(password, user.password) ) {
        return next(new AppError('کاربری با این مشخصات پیدا نشد', StatusCodes.NOT_FOUND))
    }

    // check password
    // if ( !passwordUtils.isValidPassword(password, user.password) ) {
    //     return res
    //         .status(403)
    //         .json({ message: "ایمیل و رمزعبور صحیح نمی باشد" });
    //     return next(new AppError('ایمیل و رمز عبور صحیح نمیباشد'))
    // }

    // convert user into object and remove password key
    const userObject = passwordUtils.removeOnePropertyInObject(user, 'password');

    // generate access token
    const { accessToken, refreshToken } = generateTokens(user)

    // set refresh token
    user.refresh_token = refreshToken
    await user.save()

    return res.status(200).json({ user: userObject, accessToken });
};

exports.refreshToken = async (req, res, next) => {
    const { refreshToken } = req.body

    if ( !refreshToken ) {
        return next(new AppError('توکن رفرش الزامی است', StatusCodes.BAD_REQUEST))
    }

    const decoded = verifyRefreshToken(refreshToken);
    if ( !decoded ) {
        return next(new AppError('توکن رفرش نا معتبر یا منقضی شده', StatusCodes.FORBIDDEN))
    }

    const user = await userModel.findOne({ refresh_token: refreshToken });
    if ( !user ) {
        return next(new AppError('کاربر مرتبط با این توکن رفرش یافت نشد', StatusCodes.NOT_FOUND));
    }

    if ( user.refresh_token !== refreshToken ) {
        return next(new AppError('توکن رفرش برای این کاربر معتبر نمی‌باشد', StatusCodes.FORBIDDEN));
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    return res.json({
        message: 'توکن‌ها با موفقیت بروزرسانی شدند',
        accessToken,
        refreshToken: newRefreshToken
    });
};