const categoryModel = require('./../../models/category')
const validator = require('./../../validators/category')
const isValidId = require('./../../utils/isValidID')
const paginate = require("./../../utils/paginate");

exports.create = async (req, res) => {
    try {
        // data validation
        const validationResult = validator(req.body)
        if ( validationResult !== true ) {
            return res
                .status(422)
                .json({ message: 'خطای اعتبارسنجی', error: validationResult });
        }

        const { title } = req.body;

        // create new category
        const category = await categoryModel.create({
            title
        })
        return res.status(201).json({
            message: 'دسته بندی شما با موفقیت اضافه شد .',
            category
        })
    } catch ( error ) {
        console.log(error.message)
        return res.status(500).json({ message: 'خطا در سرور' })
    }

}

exports.getAll = async (req, res) => {
    try {
        const categories = await paginate(categoryModel, {
            page: req.query.page,
            limit: req.query.limit,
            select: '-__v',
            useLean: true,
        })

        return res.status(200).json(categories)
        // return res.status(200).json({ articles })
    } catch ( error ) {
        return res.status(500).json({ message: 'خطا در سرور' })
    }
}

exports.findOne = async (req, res) => {
    try {
        const { identifier } = req.params

        // identifier validation
        if ( identifier == '' || identifier === null ) {
            return res.status(409).json({ message: 'شناسه دسته بندی دریافت نشد' })
        }

        // get category
        const category = await categoryModel.findOne({ _id: identifier })
            .select('-__v')
            .lean()
        if ( !category ) {
            return res.status(404).json({ message: 'دسته بندی مورد نظر یافت نشد' })
        }

        res.status(200).json({ category })
    } catch ( error ) {
        return res.status(500).json({ message: 'خطا در سرور' })
    }
}


// *********************************************************
exports.edit = async (req, res) => {
    try {
        const { id } = req.params
        if ( !isValidId(id) ) {
            return res.status(400).json({ message: 'شناسه دسته بندی نامعتبر است' })
        }

        let { title } = req.body

        const category = await categoryModel.findByIdAndUpdate({ _id: id }, { title }, { new: true }).select('-__v');
        if ( !category ) {
            return res.status(404).json({ message: 'دسته بندی مورد نظر یافت نشد' })
        }
        return res.status(200).json({ message: 'دسته بندی ویرایش شد', category })
    } catch ( error ) {
        console.log(error.message)
        return res.status(500).json({ message: 'خطا در سرور' })
    }
}
exports.remove = async (req, res) => {
    const { id } = req.params;
    try {

        if ( !isValidId(id) ) {
            return res.status(400).json({ message: 'شناسه دسته بندی نامعتبر است' })
        }
        const category = await categoryModel.findOneAndDelete({ _id: id });
        if ( !category ) {
            return res.status(404).json({ message: 'همچین دسته بندی ای وجود نداره' });
        }
        return res.status(200).json({ message: 'دسته بندی با موفقیت حذف شد .' })
    } catch ( e ) {
        return res.status(500).json({ message: 'خطا در سرور' })
    }
}