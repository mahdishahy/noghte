const commentModel = require('./../../models/comment')
const articleModel = require('./../../models/article')

exports.create = async (req, res) => {
    try {
        const { content, articleSlug } = req.body
        const user = req.user._id

        // content field validation
        if ( content.length < 5 ) {
            return res.status(422).json({ message: 'کامنت شما حداقل باید 5 کاراکتر باشد' })
        }

        const article = await articleModel.findOne({ slug: articleSlug }).select('-__v').lean()

        const comment = commentModel.create({
            content,
            article: article._id,
            user,
        })

        return res.status(201).json({ message: 'نظر شما ثبت شد بعد از تایید نمایش داده خواهد شد' })
    } catch ( error ) {
        console.log(error.message)
        return res.status(500).json({ message: 'خطا در سرور' })
    }
}