const userModel = require('./../../models/user')
const categoryModel = require('./../../models/category')
const { StatusCodes } = require('http-status-codes');

exports.get = async (req, res) => {

    const userId = req.user._id

    // get user
    const user = await userModel.findById(userId).populate('favorites', 'title').select('-__v').lean()

    if ( user.favorites.length != 0 ) {
        return res.status(200).json(user.favorites)
    }

    // get categories (favorites)
    const categories = await categoryModel.find({})
        .select('title')
        .lean()

    return res.status(200).json({
        message: 'شما هیچ علاقه مندی ندارید. لطفا علاقه مندی های خود را اضافه بکنید',
        categories
    })

}

exports.create = async (req, res) => {

    const userId = req.user._id
    const { favorites } = req.body

    if ( !Array.isArray(favorites) || favorites.length === 0 ) {
        return res.status(400).json({ message: 'هیچ علاقه مندی انتخاب نشده' })
    }

    const categories = await categoryModel.find({ title: { $in: favorites } }).select('_id title').lean()

    if ( categories.length !== favorites.length ) {
        return next(new AppError('دسته بندی نامعتبر است ', StatusCodes.BAD_REQUEST))
        return res.status(400).json({ message: 'دسته بندی نامعتبر است' })
    }

    // a list of new user favorites
    let userFavorites = []

    for ( const category of categories ) {
        userFavorites.push(category._id)
    }

    // update user
    const user = await userModel.findByIdAndUpdate(userId, {
        $set: { favorites: userFavorites }
    }, { new: true })

    return res.status(200).json({ message: 'علاقه‌مندی‌ها با موفقیت ذخیره شدند.' });

}