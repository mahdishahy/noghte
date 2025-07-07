const commentModel = require('./../../models/comment')
const articleModel = require('./../../models/article')
const AppError = require('./../../utils/AppError');
const { StatusCodes } = require("http-status-codes");

exports.create = async (req, res, next) => {
    const { content, articleSlug } = req.body
    const user = req.user._id

    // content field validation
    if ( content.length < 5 ) {
        return next(new AppError('کامنت شما حداقل باید ۵ کارکتر باشد', StatusCodes.UNPROCESSABLE_ENTITY))
    }

    const article = await articleModel.findOne({ slug: articleSlug }).select('-__v').lean()

    const comment = commentModel.create({
        content,
        article: article._id,
        user,
    })

    return res.status(StatusCodes.CREATED).json({ message: 'نظر شما ثبت شد بعد از تایید نمایش داده خواهد شد' })

}