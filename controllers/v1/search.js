const articleModel = require('./../../models/article')
const tagModel = require('./../../models/tag')
const categoryModel = require('./../../models/category')
const paginate = require("./../../utils/paginate");
const AppError = require('./../../utils/AppError');
const { StatusCodes } = require('http-status-codes');

exports.search = async (req, res, next) => {
    const q = String(req.query.q || '').trim() // q is a keyword for search. it's mean that searching by q.

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = ( page - 1 ) * limit;

    if ( !q ) {
        return next(new AppError('لطفا از کلمات کلیدی برای جستجو استفاده کنید', StatusCodes.BAD_REQUEST))
    }

    const regexQuery = { $regex: q, $options: 'i' };

    // find in categorys doc
    const matchingCategory = await categoryModel.find({ title: regexQuery }).select('_id')
    const categoryIds = matchingCategory.map(category => category._id)

    // find in tags doc
    const matchingTag = await tagModel.find({ title: regexQuery }).select('_id')
    const tagIds = matchingTag.map(tag => tag._id)

    const searchQuery = {
        status: 'PUBLISHED',
        $or: [
            { title: regexQuery },
            { content: regexQuery },
            ...( categoryIds.length > 0 ? [{ category: { $in: categoryIds } }] : [] ),
            ...( tagIds.length > 0 ? [{ tags: { $in: tagIds } }] : [] )
        ]
    }

    const result = await paginate(articleModel, {
        filter: searchQuery,
        page: page,
        limit: limit,
        useLean: true,
        select: '-__v',
        populate: [
            { path: 'category', select: 'title' },
            { path: 'tags', select: 'title' }
        ]
    });

    if ( result.data.length === 0 ) {
        return next(new AppError('مقاله ای مطابق با جستجو شما پیدا نشد', StatusCodes.NOT_FOUND))
    }

    res.status(StatusCodes.OK).json({
        searched: q,
        result
    });
}