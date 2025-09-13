const userModel = require('./../../models/user')
const categoryModel = require('./../../models/category')
const AppError = require('./../../utils/AppError');
const { StatusCodes } = require('http-status-codes');

exports.get = async (req, res, next) => {

    const userId = req.user._id

    // get user
    const user = await userModel.findById(userId).populate('favorites', 'title').select('-__v').lean()

    if ( user.favorites.length != 0 ) {
        return res.json(user.favorites)
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

exports.create = async (req, res, next) => {

    const userId = req.user._id
    const { favorites } = req.body

    if ( !Array.isArray(favorites) || favorites.length === 0 ) {
        return next( new AppError('هیچ علاقه مندی انتخاب نشده', StatusCodes.BAD_REQUEST))
    }

    const categories = await categoryModel.find({ title: { $in: favorites } }).select('_id title').lean()

    if ( categories.length !== favorites.length ) {
        return next(new AppError('دسته بندی نامعتبر است ', StatusCodes.BAD_REQUEST))
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

    return res.json({ message: 'علاقه‌مندی‌ها با موفقیت ذخیره شدند.' });

}