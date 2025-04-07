const interestModel = require('./../../models/interest')
const isValidId = require('./../../utils/isValidID')

exports.get = async (req, res) => {
    try {
        const userID = req.user._id;

        let interest = await interestModel
            .findOne({ user: userID })
            .populate('categories', 'title -_id');

        if ( !interest ) {
            return res.status(200).json({ message: 'لیست علاقه مندی ها خالی است' });
        }

        return res.status(200).json({
            categories: interest.categories
        });
    } catch ( error ) {
        return res.status(500).json({ message: 'خطا در سرور' })
    }
}

exports.edit = async (req, res) => {
    try {
        const userID = req.user._id;
        const { categories } = req.body;

        let interest = await interestModel.findOne({ user: userID })

        if ( !interest ) {
            interest = await interestModel.create({
                user: userID,
                categories: categories
            })
        }
        for ( const category of categories ) {
            if ( !isValidId(category) ) {
                return res.status(400).json({ message: 'شناسه دسته بندی وارد شده نا معتبر است .' });
            }
        }
        interest.categories = categories;
        await interest.save();

        return res.status(200).json({ message: 'لیست علاقه مندی ها با موفقیت بروز رسانی شد .' });

    } catch ( error ) {
        return res.status(500).json({ message: 'خطا در سرور' })
    }
}