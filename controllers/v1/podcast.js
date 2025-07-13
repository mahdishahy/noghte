const podcastModel = require('../../models/podcast')
const tagModel = require('../../models/tag')
const commentModel = require('../../models/comment')
const validator = require('../../validators/podcast')
const isValidId = require('../../utils/isValidID')
const { generateManualSlug } = require("../../utils/slug");
const paginate = require("../../utils/paginate");
const AppError = require('../../utils/AppError');
const { StatusCodes } = require('http-status-codes');

exports.create = async (req, res, next) => {
    // data validation
    const validationResult = validator(req.body)
    if (validationResult !== true) {
        return next(new AppError("خطای اعتبارسنجی " + validationResult, StatusCodes.UNPROCESSABLE_ENTITY));
    }

    //  attention: podcast tags must be received as an array
    const { title, podcast, image_url, tags, category } = req.body;

    // validate category _id
    if (!isValidId(category)) {
        return next(new AppError('دسته بندی نا معتبر است', StatusCodes.BAD_REQUEST))
    }

    const owner = req.user._id
    const tagIDs = []

    for (const tagName of tags) {
        let tag = await tagModel.findOne({ title: tagName })
        if (!tag) {
            tag = await tagModel.create({ title: tagName })
        }
        tagIDs.push(tag._id)
    }

    // create new podcast
    const newPodcast = podcastModel.create({
        title, podcast, image_url, owner, tags: tagIDs, category
    })
    return res.status(StatusCodes.CREATED).json({
        message: 'پادکست با موفقیت ساخته شد و در دست بررسی است، پس از تایید در وبسایت منتظر خواهد شد'
    })

}

exports.getAll = async (req, res) => {
    const podcasts = await paginate(podcastModel, {
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
                select: 'podcast status -_id',
                populate: { path: 'user', select: 'full_name -_id' }
            }
        ]
    })

    return res.json(podcasts)
}

exports.findOne = async (req, res, next) => {
    const { identifier } = req.params
    // identifier validation
    if (identifier == '' || identifier === null) {
        return next(new AppError('شناسه پادکست دریافت نشد', StatusCodes.CONFLICT))
    }

    // get podcast
    const podcast = await podcastModel.findOne({ $or: [{ _id: identifier }, { slug: identifier }] })
        .populate('tags', 'title')
        .populate('owner', 'full_name')
        .populate('category', 'title')
        .select('-__v')
        .lean()
    if (!podcast) {
        return next(new AppError('شناسه پادکست یاقت نشد', StatusCodes.NOT_FOUND))
    }
    // get comments
    const comments = await commentModel.find({ podcast: podcast._id, status: 'approved' })
        .populate('user', 'full_name -_id -podcast')
        .select('-__v')
        .lean()

    return res.json({ ...podcast, comments })
}

exports.edit = async (req, res, next) => {
    const { id } = req.params
    if (!isValidId(id)) {
        return next(new AppError('شناسه پادکست نا معتبر است', StatusCodes.BAD_REQUEST))
    }

    let { title, podcast, image_url, tags, category } = req.body
    const userId = req.user._id

    const editedPodcast = await podcastModel.findById(id)
    if (!editedPodcast) {
        return next(new AppError('پادکست مورد نظر پیدا نشد', StatusCodes.NOT_FOUND))
    }

    if (editedPodcast.owner.toString() !== userId.toString()) {
        return next(new AppError('شما اجازه ویرایش پادکست را ندارید', StatusCodes.FORBIDDEN))
    }
    // validate category _id
    if (category && !isValidId(category)) {
        return next(new AppError('دسته بندی نا معتبر است', StatusCodes.BAD_REQUEST))
    }

    if (title && title !== editedPodcast.title) {
        req.body.slug = generateManualSlug(title)
    }

    let tagIds = [];
    if (!tags) {
        tags = editedPodcast.tags
    }

    for (const tagName of tags) {
        let tag = await tagModel.findOne({ title: tagName });
        if (!tag) {
            tag = await tagModel.create({ title: tagName });
        }
        tagIds.push(tag._id);
    }

    const updatedPodcast = await podcastModel.findByIdAndUpdate(
        { _id: id },
        { title, podcast, image_url, tags: tagIds, category },
        { new: true }
    )

    return res.json({ message: 'پادکست ویرایش شد' })
}

exports.remove = async (req, res, next) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return next(new AppError('شناسه پادکست نامعتبر است', StatusCodes.BAD_REQUEST))
    }

    const podcast = await podcastModel.findOneAndDelete({ _id: id });
    if (!podcast) {
        return next(new AppError('همچین پادکست ای وجود ندارد', StatusCodes.NOT_FOUND))
    }

    return res.json({ message: 'پادکست با موفقیت حذف شد ' })
}
exports.changeStatus = async (req, res, next) => {
    const { status } = req.body;
    const { id } = req.params;

    const allowdStatuses = ["DRAFT", "PUBLISHED", "PENDING"];

    if (!isValidId(id)) {
        return next(new AppError('همچین پادکست ای یافت نشد ', StatusCodes.NOT_FOUND))
    }
    if (!allowdStatuses.includes(status)) {
        return next(new AppError('وضیعت پادکست وارد شده نامعتبر است ', StatusCodes.BAD_REQUEST))
    }
    const podcast = await podcastModel.findByIdAndUpdate({ _id: id }, { status }, { new: true });

    res.status(200).json({ message: `وضعیت پادکست با موفقیت تغییر کرد `, podcast });
}