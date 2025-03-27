const articleModel = require('./../../models/article')
const tagModel = require('./../../models/tag')
const validator = require('./../../validators/article')

exports.create = async (req, res) => {
    try {
        // data validation
        const validationResult = validator(req.body)
        if ( validationResult !== true ) {
            return res
                .status(422)
                .json({ message: "خطای اعتبارسنجی", error: validationResult });
        }

        //  attention: Article tags must be received as an array
        const { title, content, image_url, tags } = req.body;
        const owner = req.user._id
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
            title,
            content,
            image_url,
            owner,
            tags: tagIDs
        })
        return res.status(201).json({
            message: 'مقاله با موفقیت ساخته شد و در دست بررسی است، پس از تایید در وبسایت منتظر خواهد شد'
        })
    } catch ( error ) {
        console.log(error.message)
        return res.status(500).json({ message: 'خطا در سرور' })
    }

}