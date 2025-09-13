const userModel = require('./../../models/user')
const isValidId = require('./../../utils/isValidID')
const AppError = require('./../../utils/AppError');
const { StatusCodes } = require('http-status-codes');

exports.suspend = async (req, res, next) => {
    const { id } = req.params
    const { reason } = req.body

    // id validation
    if ( !isValidId(id) ) {
        return next(new AppError('شناسه کاربر نا معتبر است', StatusCodes.BAD_REQUEST))
    }

    // reason validation
    if ( reason === '' || !reason ) {
        return next(new AppError('دلیل تعلیق کاربر الزامی است', StatusCodes.BAD_REQUEST))
    }

    // get main user with id
    const mainUser = await userModel.findOne({ _id: id })
    if ( !mainUser ) {
        return next(new AppError('کاربر مورد نظر پیدا نشد', StatusCodes.NOT_FOUND))

    }

    // check id the user is already suspend
    if ( mainUser.is_suspended ) {
        return next(new AppError('کاربر از قبل تعلیق شده است', StatusCodes.CONFLICT))
    }

    const suspend = await userModel.findByIdAndUpdate(id, {
        is_suspended: true,
        suspension_reason: reason
    })
    return res.status(StatusCodes.CREATED).json({ message: 'کاربر تعلیق شد' })
}