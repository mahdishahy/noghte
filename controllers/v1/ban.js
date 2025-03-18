const userModel = require('./../../models/user')
const isValidId = require('./../../utils/isValidID')

exports.suspend = async (req, res) => {
    try {
        const { id } = req.params
        const { reason } = req.body

        // id validation
        if ( !isValidId(id) ) {
            return res.status(409).json({ message: 'شناسه کاربر نامعتبر است' })
        }

        // reason validation
        if ( reason === '' || !reason ) {
            return res.status(409).json({ message: 'دلیل تعلیق کاربر الزامی است' })
        }

        // get main user with id
        const mainUser = await userModel.findOne({ _id: id })
        if ( !mainUser ) {
            return res.status(404).send({ message: 'کاربر مورد نظر یافت نشد' })
        }

        // check id the user is already suspend
        if ( mainUser.is_suspended ) {
            return res.status(409).json({ message: 'کاربر از قبل تعلیق شده' })
        }

        const suspend = await userModel.findByIdAndUpdate(id, {
            is_suspended: true,
            suspension_reason: reason
        })
        return res.status(201).json({ message: 'کاربر تعلیق شد' })
    } catch ( error ) {
        return res.status(500).json({ message: "خطا در سرور" })
    }
}