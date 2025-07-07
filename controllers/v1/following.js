const userModel = require('./../../models/user')
const isValidId = require('./../../utils/isValidID')
const { StatusCodes } = require('http-status-codes');

exports.followUser = async (req, res) => {
    const currentUserId = req.user._id
    const targetUserId = req.params.id

    // check id validation
    if ( !isValidId(currentUserId) && !isValidId(targetUserId) ) {
        return next(new AppError('شناسه کاربر نامعتبر است', StatusCodes.CONFLICT))

    }

    // checking if IDs are not equal to each other
    if ( currentUserId === targetUserId ) {
        return next(new AppError('شما نمی توانید خودتان را دنبال کنید', StatusCodes.BAD_REQUEST))
    }

    // first way
    // const currentUser = await userModel.findById(currentUserId)
    // const targetUser = await userModel.findById(targetUserId)

    // seconde way
    // get users
    const [currentUser, targetUser] = await Promise.all([
        userModel.findById(currentUserId),
        userModel.findById(targetUserId),
    ])

    if ( !targetUser ) {
        return next(new AppError('کاربر مورد نظر یافت نشد', StatusCodes.NOT_FOUND))
    }

    // check alreadty exist followed
    if ( currentUser.followed.includes(targetUserId) ) {
        return next(new AppError('شما قبلا این کابر را دنبال کرده اید', StatusCodes.BAD_REQUEST))
    }

    currentUser.followed.push(targetUserId)
    targetUser.follower.push(currentUserId)

    await Promise.all([currentUser.save(), targetUser.save()])
    return res.status(200).json({ message: `از این لحظه شما ${ targetUser.full_name } را دنبال کردید` })

}

exports.unfollowUser = async (req, res) => {

    const currentUserId = req.user._id
    const targetUserId = req.params.id

    // check id validation
    if ( !isValidId(currentUserId) && !isValidId(targetUserId) ) {
        return next(new AppError('شناسه کاربر نامعتبر است', StatusCodes.CONFLICT))
    }

    // get users
    const [currentUser, targetUser] = await Promise.all([
        userModel.findById(currentUserId),
        userModel.findById(targetUserId),
    ])

    if ( !targetUser ) {
        return next(new AppError('کاربر مورد نظر یافت نشد', StatusCodes.NOT_FOUND))
    }

    const isFollowing = currentUser.followed.includes(targetUserId);
    if ( !isFollowing ) {
        return next(new AppError('شما این کاربر را دنبال نکرده اید', StatusCodes.CONFLICT))
    }

    // remove
    await Promise.all([
        userModel.findByIdAndUpdate(currentUserId, {
            $pull: { followed: targetUserId }
        }),
        userModel.findByIdAndUpdate(targetUserId, {
            $pull: { follower: currentUserId }
        })
    ])

    return res.status(200).json({ message: 'کاربر مورد نظر با موفقیت از لیست دنبال‌شوندگان شما حذف شد.' })

}