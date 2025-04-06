const userModel = require('./../../models/user')
const isValidId = require('./../../utils/isValidID')

exports.followUser = async (req, res) => {
    try {
        const currentUserId = req.user._id
        const targetUserId = req.params.id

        // check id validation
        if ( !isValidId(currentUserId) && !isValidId(targetUserId) ) {
            return res.status(409).json({ message: 'شناسه کاربر نامعتبر است' })
        }

        // checking if IDs are not equal to each other
        if ( currentUserId === targetUserId ) {
            return res.status(400).json({ message: 'شما نمی توانید خودتان را دنبال کنید' })
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
            return res.status(404).json({ message: 'کاربر مورد نظر یافت نشد' })
        }

        // check alreadty exist followed
        if ( currentUser.followed.includes(targetUserId) ) {
            return res.status(400).json({ message: 'شما قبلا این کاربر را دنبال کرده اید' })
        }

        currentUser.followed.push(targetUserId)
        targetUser.follower.push(currentUserId)

        await Promise.all([currentUser.save(), targetUser.save()])
        return res.status(200).json({ message: `از این لحظه شما ${ targetUser.full_name } را دنبال کردید` })
    } catch ( error ) {
        return res.status(500).json({ message: 'خطا در سرور' })
    }
}

exports.unfollowUser = async (req, res) => {
    try {
        const currentUserId = req.user._id
        const targetUserId = req.params.id

        // check id validation
        if ( !isValidId(currentUserId) && !isValidId(targetUserId) ) {
            return res.status(409).json({ message: 'شناسه کاربر نامعتبر است' })
        }

        // get users
        const [currentUser, targetUser] = await Promise.all([
            userModel.findById(currentUserId),
            userModel.findById(targetUserId),
        ])

        if ( !targetUser ) {
            return res.status(404).json({ message: 'کاربر مورد نظر یافت نشد' })
        }

        const isFollowing = currentUser.followed.includes(targetUserId);
        if ( !isFollowing ) {
            return res.status(409).json({ message: 'شما این کاربر را دنبال نکرده اید' });
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
    } catch ( error ) {
        return res.status(500).json({ message: 'خطا در سرور' })
    }
}