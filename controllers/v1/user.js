const userModel = require("./../../models/user");
const isValidId = require("./../../utils/isValidID");
const passwordUtils = require("./../../utils/password");
const paginate = require("./../../utils/paginate");
const AppError = require('./../../utils/AppError')
const { StatusCode } = require('http-status-codes')

exports.getById = async (req, res, next) => {
    const { id } = req.params;

    // id validation
    if ( !isValidId(id) ) {
        // return res.status(409).json({ message: "شناسه کاربر نامعتبر است" });
        return next(new AppError('شناسه کاربر نا معتبر است', StatusCode.BAD_REQUEST))
    }

    // get main user with id
    const user = await userModel.findOne({ _id: id });
    if ( !user ) {
        // return res.status(404).json({ message: "کاربر مورد نظر یافت نشد" });
        return next(new AppError('کاربر مورد نظر یافت نشد', StatusCode.NOT_FOUND))
    }

    return res.json({ user });
};

exports.getAll = async (req, res) => {
    const users = await paginate(userModel, {
        page: req.query.page,
        limit: req.query.limit,
        useLean: true,
        select: '-password -__v'
    });
    return res.json(users);
};

exports.remove = async (req, res, next) => {

    const { id } = req.params;

    // id validation
    if ( !isValidId(id) ) {
        // return res.status(409).json({ message: "شناسه کاربر نامعتبر است" });
        return next(new AppError('شناسه کاربر نامعتبر است', StatusCode.BAD_REQUEST))
    }

    // remove user with id
    const user = await userModel.findOneAndDelete({ _id: id });
    if ( !user ) {
        // return res.status(404).json({ message: "کاربر مورد نظر یافت نشد" });
        return next(new AppError('کاربر مورد نظر پیدا نشد', StatusCode.NOT_FOUND))
    }

    return res.json({ message: 'کاربر با موفقیت حذف شد' });

};

exports.changeRole = async (req, res, next) => {

    const { id } = req.params;
    let { role } = req.body;

    // id validation
    if ( !isValidId(id) ) {
        return next(new AppError('شناسه کاربر نامعتبر است', StatusCodes.BAD_REQUEST));
    }

    role = role.toUpperCase();
    // role validation
    if ( role !== "ADMIN" || role !== "USER" ) {
        return next(new AppError("نقش کاربر نامعتبر است. نقش باید 'ADMIN' یا 'USER' باشد.", StatusCodes.BAD_REQUEST));
    }

    // change user role with id
    const user = await userModel.findOneAndUpdate(
        { _id: id },
        { role },
        { new: true }
    );
    if ( !user ) {
        return next(new AppError('کاربر مورد نظر یافت نشد', StatusCodes.NOT_FOUND));
    }
    const userObject = passwordUtils.removeOnePropertyInObject(
        user,
        "password"
    );

    return res.json({ message: 'نقش کاربر با موفقیت تغییر کرد', user: userObject });

};

exports.update = async (req, res) => {

    const { id } = req.params;
    let { full_name, username, email, phone_number, image_url } = req.body;

    // id validation
    if ( !isValidId(id) ) {
        return next(new AppError('شناسه کاربر نامعتبر است', StatusCodes.CONFLICT))
    }

    // update user with id
    const user = await userModel
        .findOneAndUpdate(
            { _id: id },
            {
                full_name,
                username,
                email,
                phone_number,
                image_url,
            },
            { new: true }
        );

    if ( !user ) {
        return next(new AppError('کاربر مورد نظر یافت نشد', StatusCodes.NOT_FOUND))
    }

    // remove password property
    const userObject = passwordUtils.removeOnePropertyInObject(
        user,
        "password"
    );

    return res
        .status(200)
        .json({ message: "کاربر با موفقیت ویرایش شد", user: userObject });

};

exports.getByUserName = async (req, res) => {

    const match = req.path.match(/^\/@([a-zA-Z0-9_]{5,15})$/);
    const username = match?.[1]

    if ( !username ) {
        return next(new AppError('نام کاربری نا معتبر است', StatusCodes.BAD_REQUEST))
    }

    // get user
    const user = await userModel.findOne({ username })
        .populate('follower', 'username')
        .populate('followed', 'username')
        .select('-password -phone_number -suspension_reason -__v')

    // check user suspension
    if ( user.is_suspended ) {
        return next(new AppError('این کاربر به دلیل تخلفات محرز تعلیق میباشد', StatusCodes.FORBIDDEN))
    }

    if ( !user ) {
        return next(new AppError('کاربر مورد نظر یافت نشد', StatusCodes.NOT_FOUND))
    }

    return res.status(200).json(user)

}