const { StatusCodes } = require(`http-status-codes`);
const isValidId = require(`./isValidID`);
const AppError = require(`./AppError`);

exports.incrementLike = async (model, req, res, next, name = '') => {
    const { id } = req.params
    const userId = req.user._id


    if (!isValidId(id)) {
        return next(new AppError(`شناسه ${name} نا معتبر است`, StatusCodes.BAD_REQUEST))
    }
    const alreadyLiked = await model.findOne({ _id: id, likes: userId })
    if (alreadyLiked) {
        return next(new AppError(`شما قبلا این ${name} را لایک کرده اید`, StatusCodes.CONFLICT))
    }

    const article = await model.findOneAndUpdate({ _id: id }, { $push: { likes: userId } }, { new: true })
    if (!article) {
        return next(new AppError(`${name} مورد نظر پیدا نشد`, StatusCodes.NOT_FOUND))
    }
    const likeCount = article.likes.length
    return res.json({ message: `${name} با موفقیت لایک شد`, article: { id: article._id, likeCount } })
}

exports.decrementLike = async (model, req, res, next, name = ``) => {
    const { id } = req.params
    const userId = req.user._id

    if (!isValidId(id)) {
        return next(new AppError(`شناسه ${name} نا معتبر است`, StatusCodes.BAD_REQUEST))
    }
    const alreadyDisliked = await model.findOne({ _id: id, likes: userId })
    if (!alreadyDisliked) {
        return next(new AppError(`شما قبلا این ${name} را لایک نکرده اید`, StatusCodes.CONFLICT))
    }

    const article = await model.findOneAndUpdate({ _id: id }, { $pull: { likes: userId } }, { new: true })
    if (!article) {
        return next(new AppError(`${name} مورد نظر پیدا نشد`, StatusCodes.NOT_FOUND))
    }
    const likeCount = article.likes.length

    return res.json({ message: `${name} با موفقیت دیسلایک شد`, article: { id: article._id, likeCount } })
}
exports.getLikeCount = async (model, req, res, next, name = '') => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return next(new AppError(`شناسه ${name} نامعتبر است`, StatusCodes.BAD_REQUEST));
    }

    const article = await model.findById(id)
    if (!article) {
        return next(new AppError(`${name} مورد نظر پیدا نشد`, StatusCodes.NOT_FOUND));
    }

    return res.json({ article: { id: article._id, likeCount: article.likes.length } });
}