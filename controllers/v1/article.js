const articleModel = require('./../../models/article')
const tagModel = require('./../../models/tag')
const commentModel = require('./../../models/comment')
const validator = require('./../../validators/article')
const isValidId = require('./../../utils/isValidID')
const { generateManualSlug } = require("../../utils/slug");
const paginate = require("./../../utils/paginate");
const AppError = require('./../../utils/AppError');
const { StatusCodes } = require('http-status-codes');
const { incrementLike, decrementLike, getLikeCount } = require('../../utils/like')

exports.create = async (req, res, next) => {
    //  attention: Article tags must be received as an array
    const { title, content, image_url, tags, category, mode } = req.body;
    const owner = req.user._id

    if ( !mode || !['draft', 'submit'].includes(mode) ) {
        return next(new AppError('حالت مقاله برای ارسال ان الزامی است و فقط یکی از دو  مقدار draft یا submit را در بر می گیرد'))
    }

    if ( mode === 'submit' ) {
        // data validation
        const validationResult = validator(req.body)
        if ( validationResult !== true ) {
            return next(new AppError(`خطای اعتبارسنجی: تمامی فیلد ها الزامی هستند`, StatusCodes.UNPROCESSABLE_ENTITY));
        }

        // validate category _id
        if ( !isValidId(category) ) {
            return next(new AppError('شناسه دسته بندی  نا معتبر است', StatusCodes.BAD_REQUEST))
        }

        const tagIDs = []

        for ( const tagName of tags ) {
            let tag = await tagModel.findOne({ title: tagName })
            if ( !tag ) {
                tag = await tagModel.create({ title: tagName })
            }
            tagIDs.push(tag._id)
        }

        // create new article
        const article = articleModel.create({
            title, content, image_url, owner, tags: tagIDs, category
        })
        return res.status(StatusCodes.CREATED).json({
            message: 'مقاله با موفقیت ساخته شد و در دست بررسی است، پس از تایید در وبسایت منتظر خواهد شد'
        })
    }

    if ( !title || !content ) {
        return next(new AppError('عنوان و محتوای مقاله الزامی هستند', StatusCodes.BAD_REQUEST))
    }

    const tagIDs = []

    if ( tags ) {
        for ( const tagName of tags ) {
            let tag = await tagModel.findOne({ title: tagName })
            if ( !tag ) {
                tag = await tagModel.create({ title: tagName })
            }
            tagIDs.push(tag._id)
        }
    }

    const draftArticle = await articleModel.create({
        title: title,
        content: content,
        image_url: image_url || null,
        category: isValidId(category) ? category : null,
        tags: tagIDs,
        owner,
        status: "DRAFT"
    });

    return res.status(StatusCodes.CREATED).json({
        message: "پیش‌نویس مقاله با موفقیت ذخیره شد.",
        article: draftArticle
    });
}

exports.getAll = async (req, res) => {
    const articles = await paginate(articleModel, {
        page: req.query.page,
        limit: req.query.limit,
        select: '-__v',
        useLean: true,
        populate: [
            { path: 'tags', select: 'title' },
            { path: 'owner', select: 'username -_id' },
            { path: 'category', select: 'title -_id' },
            {
                path: 'comments',
                select: 'content status -_id',
                populate: { path: 'user', select: 'full_name -_id' }
            }
        ]
    })

    return res.json(articles)
}

exports.findOne = async (req, res, next) => {
    const { identifier } = req.params
    // identifier validation
    if ( identifier == '' || identifier === null ) {
        return next(new AppError('شناسه مقاله دریافت نشد', StatusCodes.CONFLICT))
    }

    // get article
    const article = await articleModel.findOne({ $or: [{ _id: identifier }, { slug: identifier }] })
        .populate('tags', 'title')
        .populate('owner', 'full_name')
        .populate('category', 'title')
        .select('-__v')
        .lean()
    if ( !article ) {
        return next(new AppError('شناسه مقاله یاقت نشد', StatusCodes.NOT_FOUND))
    }
    // get comments
    const comments = await commentModel.find({ article: article._id, status: 'approved' })
        .populate('user', 'full_name -_id -article')
        .select('-__v')
        .lean()

    return res.json({ ...article, comments })
}

exports.edit = async (req, res, next) => {
    const { id } = req.params
    const { mode } = req.body

    if ( !mode || !['draft', 'submit'].includes(mode) ) {
        return next(new AppError('حالت ارسال مقاله نا معتبر است', StatusCodes.BAD_REQUEST))
    }

    const article = await articleModel.findById(id)
    if ( !article ) {
        return next(new AppError('مقاله مورد نظر پیدا نشد', StatusCodes.NOT_FOUND))
    }

    let { title, content, image_url, tags, category } = req.body

    let tagIds = [];
    if ( !tags ) {
        tags = article.tags
    }

    for ( const tagName of tags ) {
        let tag = await tagModel.findOne({ title: tagName });
        if ( !tag ) {
            tag = await tagModel.create({ title: tagName });
        }
        tagIds.push(tag._id);
    }

    if ( category && !isValidId(category) ) {
        return next(new AppError('دسته بندی نا معتبر است', StatusCodes.BAD_REQUEST))
    }

    article.title = title
    article.content = content
    article.tags = tagIds
    article.category = category

    if ( mode === 'submit' ) {
        article.status = 'PENDING'
    } else if ( mode === 'draft' ) {
        article.status = 'DRAFT'
    }

    await article.save()
    return res.json({ message: 'مقاله ذخیره شد', article })
}

exports.remove = async (req, res, next) => {
    const { id } = req.params;

    if ( !isValidId(id) ) {
        return next(new AppError('شناسه مقاله نامعتبر است', StatusCodes.BAD_REQUEST))
    }

    const article = await articleModel.findOneAndDelete({ _id: id });
    if ( !article ) {
        return next(new AppError('همچین مقاله ای وجود ندارد', StatusCodes.NOT_FOUND))
    }

    return res.json({ message: 'مقاله با موفقیت حذف شد .' })
}

exports.like = async (req, res, next) => {
    incrementLike(articleModel, req, res, next)
}

exports.dislike = async (req, res, next) => {
    decrementLike(articleModel, req, res, next)
}
exports.getLikes = async (req, res, next) => {
    getLikeCount(articleModel, req, res, next)
}

exports.changeStatus = async (req, res, next) => {
    const { status } = req.body;
    const { id } = req.params;

    const allowdStatuses = ["DRAFT", "PUBLISHED", "PENDING"];

    if ( !isValidId(id) ) {
        return next(new AppError('همچین مقاله ای یافت نشد ', StatusCodes.NOT_FOUND))
    }
    if ( !allowdStatuses.includes(status) ) {
        return next(new AppError('وضیعت مقاله وارد شده نامعتبر است ', StatusCodes.BAD_REQUEST))
    }
    const article = await articleModel.findByIdAndUpdate({ _id: id }, { status }, { new: true });

    res.status(200).json({ message: `وضعیت مقاله با موفقیت تغییر کرد `, article });
}