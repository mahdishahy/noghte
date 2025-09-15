const jwt = require('jsonwebtoken')
const userModel = require('./../models/user')
const { verifyAccessToken } = require('./../utils/getToken')
module.exports = async (req, res, next) => {
    const authHeader = req.header('Authorization')?.split(' ')
    if ( authHeader?.length !== 2 ) {
        return res.status(403).json({ message: 'لطفا ثبت نام کنید' })
    }

    const token = authHeader[1]
    try {
        const decodedUserData = verifyAccessToken(token)
        if ( decodedUserData === null ) {
            return res.status(403).json({
                success: false,
                title: 'token-expired',
                message: "توکن نامعتبر یا منقضی شده"
            })
        }

        const user = await userModel.findById(decodedUserData.userId).lean()
        if ( !user ) {
            return res.status(404).json({ message: "ابتدا وارد شوید" })
        }
        req.user = user
        next()
    } catch ( error ) {
        return res.status(500).json({ message: 'خطا در سرور' })
    }
}