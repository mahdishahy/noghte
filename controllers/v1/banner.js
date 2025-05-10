const bannerModel = require('./../../models/banner')
const validator = require('./../../validators/banner')
const isValidId = require('./../../utils/isValidID')

exports.create = async (req, res) => {
    try {
        // data validation
        const validationResult = validator(req.body)
        if ( validationResult !== true ) {
            return res
                .status(422)
                .json({ message: "خطای اعتبارسنجی", error: validationResult });
        }
        const { description, link, position, status } = req.body;
        const fileUrl = `/banner/${ req.file.filename }`;
        //check for empty position
        const isExist = await bannerModel.findOne({ position })
        if ( isExist ) {
            return res
                .status(409)
                .json({
                    message: `لطفا ابتدا بنر قبلی در این موقعیت (${ position }) رو پاک کنید .`,
                    error: validationResult
                });
        }
        const banner = await bannerModel.create({
            description,
            link,
            file: fileUrl,
            position,
            status,
        })
        return res.status(200).json({
            message: 'بنر مورد نظر شما با موفقیت اضافه شد.'
        })
    } catch ( error ) {
        console.log(error.message)
        return res.status(500).json({ message: 'خطا در سرور' })
    }

}
exports.getAll = async (req, res) => {
    try {
        const banners = await bannerModel.find();
        return res.status(200).json({
            status: true,
            banners
        })
    } catch ( error ) {
        return res.status(500).json({ message: 'خطا در سرور' })
    }
}
exports.remove = async (req, res) => {
    try {
        if ( !isValidId(req.params.id) ) {
            return res.status(400).json({ message: 'شناسه بنر نامعتبر است' })
        }
        const banner = await bannerModel.findOneAndDelete({ _id: req.params.id })
        return res.status(200).json({ message: 'بنر با موفقیت حذف شد', status: true })
    } catch ( e ) {
        return res.status(500).json({ message: 'خطا در سرور' })
    }
}