const commentModel = require('./../../models/comment')
const articleModel = require('./../../models/article')
const AppError = require('./../../utils/AppError');
const { StatusCodes } = require("http-status-codes");

exports.create = async (req, res, next) => {
    const { content, articleSlug } = req.body
    const user = req.user._id

    // content field validation
    if (content.length < 5) {
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

exports.changeStatus = async (req, res, next) => {
    const { status } = req.body;
    const { id } = req.params;

    const allowdStatuses = ["PENDING", "APPROVED", "REJECTED"];

    if (!isValidId(id)) {
        return next(new AppError('همچین کامنت ای یافت نشد ', StatusCodes.NOT_FOUND))
    }
    if (!allowdStatuses.includes(status)) {
        return next(new AppError('وضیعت کامنت وارد شده نامعتبر است لطفا یکی از این وضعیت ها را انتخاب نمایید ["PENDING", "APPROVED", "REJECTED"] ', StatusCodes.BAD_REQUEST))
    }
    const comment = await commentModel.findByIdAndUpdate({ _id: id }, { status }, { new: true });

    res.status(200).json({ message: `وضعیت کامنت با موفقیت تغییر کرد `, comment });
}