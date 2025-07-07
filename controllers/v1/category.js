const categoryModel = require('./../../models/category')
const validator = require('./../../validators/category')
const isValidId = require('./../../utils/isValidID')
const paginate = require("./../../utils/paginate");
const { StatusCodes } = require('http-status-codes');

exports.create = async (req, res) => {

    // data validation
    const validationResult = validator(req.body)
    if ( validationResult !== true ) {
        return next(new AppError('خطای اعتبار سنجی', StatusCodes.UNPROCESSABLE_ENTITY))
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

}

exports.getAll = async (req, res) => {
    const categories = await paginate(categoryModel, {
        page: req.query.page,
        limit: req.query.limit,
        select: '-__v',
        useLean: true,
    })

    return res.status(200).json(categories)
    // return res.status(200).json({ articles })

}

exports.findOne = async (req, res) => {

    const { identifier } = req.params

    // identifier validation
    if ( identifier == '' || identifier === null ) {
        return next(new AppError('شناسه دسته بندی دریافت نشد', StatusCodes.CONFLICT))
    }

    // get category
    const category = await categoryModel.findOne({ _id: identifier })
        .select('-__v')
        .lean()
    if ( !category ) {
        return next(new AppError('دسته بندی مورد نظر یافت نشد', StatusCodes.NOT_FOUND))
    }

    res.status(200).json({ category })

}


// *********************************************************
exports.edit = async (req, res) => {

    const { id } = req.params
    if ( !isValidId(id) ) {
        return next(new AppError('شناسه دسته بندی نامعتبر است', StatusCodes.BAD_REQUEST))
    }

    let { title } = req.body

    const category = await categoryModel.findByIdAndUpdate({ _id: id }, { title }, { new: true }).select('-__v');
    if ( !category ) {
        return next(new AppError('دسته بندی مورد نظر یافت نشد', StatusCodes.NOT_FOUND))
    }
    return res.status(200).json({ message: 'دسته بندی ویرایش شد', category })

}
exports.remove = async (req, res) => {
    const { id } = req.params;

    if ( !isValidId(id) ) {
        return next(new AppError('شناسه دسته بندی نامعتبر است', StatusCodes.BAD_REQUEST))
    }
    const category = await categoryModel.findOneAndDelete({ _id: id });
    if ( !category ) {
        return next(new AppError('دسته بندی مورد نظر یافت نشد', StatusCodes.NOT_FOUND))
    }
    return res.status(200).json({ message: 'دسته بندی با موفقیت حذف شد .' })

}