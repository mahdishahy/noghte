const articleModel = require('./../../models/article')
const tagModel = require('./../../models/tag')
const commentModel = require('./../../models/comment')
const validator = require('./../../validators/article')
const { generateSlug } = require("./../../middlewares/article");
const isValidId = require('./../../utils/isValidID')
const { populate } = require("dotenv");

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
            title, content, image_url, owner, tags: tagIDs
        })
        return res.status(201).json({
            message: 'مقاله با موفقیت ساخته شد و در دست بررسی است، پس از تایید در وبسایت منتظر خواهد شد'
        })
    } catch ( error ) {
        console.log(error.message)
        return res.status(500).json({ message: 'خطا در سرور' })
    }

}

exports.getAll = async (req, res) => {
    try {
        const articles = await articleModel.find({})
            .populate('tags', 'title')
            .populate('owner', 'username -_id')
            .select('-__v')
            .lean()
            .sort({ createdAt: -1 })

        // get articles comments
        const comments = await commentModel.find({})
            .populate('user', 'full_name -_id')
            .lean()
            .select('-__v')

        const allArticles = []

        articles.forEach((article) => {
            const articleComments = comments.filter((comment) => {
                return comment.article.toString() === article._id.toString()
            })

            allArticles.push({
                ...article, comments: articleComments
            })
        })

        return res.status(200).json(allArticles)
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
            return res.status(409).json({ message: 'شناسه مقاله دریافت نشد' })
        }

        // get article
        const article = await articleModel.findOne({ $or: [{ id: identifier }, { slug: identifier }] })
            .populate('tags', 'title')
            .populate('owner', 'full_name')
            .select('-__v')
            .lean()

        // get comments
        const comments = await commentModel.find({ article: article._id, status: 'approved' })
            .populate('user', 'full_name -_id -article')
            .select('-__v')
            .lean()

        res.status(200).json({ ...article, comments })
    } catch ( error ) {
        return res.status(500).json({ message: 'خطا در سرور' })
    }
}



// *********************************************************
exports.edit = async (req, res) => {
    try {
        const { id } = req.params
        if ( !isValidId(id) ) {
            return res.status(400).json({ message: 'شناسه مقاله نامعتبر است' })
        }

        let { title, content, image_url, tags } = req.body
        const userId = req.user._id

        const article = await articleModel.findById(id)
        if ( !article ) {
            return res.status(404).json({ message: 'مقاله مورد نظر یافت نشد' })
        }

        if ( article.owner.toString() !== userId.toString() ) {
            return res.status(403).json({ message: 'شما اجازه ویرایش مقاله را ندارید' })
        }

        if (title && title !== article.title) {
            req.body.slug = await generateSlug(title.toString());
        }

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


        const updatedArticle = await articleModel.findByIdAndUpdate({ _id: id },
            {
                title, content, image_url, tags: tagIds
            }, { new: true })

        return res.status(200).json({ message: 'مقاله ویرایش شد' })
    } catch ( error ) {
        console.log(error.message)
        return res.status(500).json({ message: 'خطا در سرور' })
    }
}