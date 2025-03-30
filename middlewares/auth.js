const jwt = require('jsonwebtoken')
const userModel = require('./../models/user')

module.exports = async (req, res, next) => {
    const authHeader = req.header('Authorization')?.split(' ')
    if ( authHeader?.length !== 2 ) {
        return res.status(403).json({ message: 'لطفا ثبت نام کنید' })
    }

    const token = authHeader[1]
    try {
        const payloadData = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(payloadData.id).lean()
        if ( !user ) {
            return res.status(404).json({ message: "ابتدا وارد شوید ." })
        }
        req.user = user
        next()
    } catch ( error ) {
        return res.status(500).json({ message: 'خطا در سرور' })
    }
}