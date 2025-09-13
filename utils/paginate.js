const paginate = async (model, options = {}) => {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const sort = options.sort || { createdAt: -1 };
    const filter = options.filter || {};
    const populate = options.populate || '';
    const useLean = options.lean || false;
    const select = options.select || '';

    const skip = ( page - 1 ) * limit;

    let query = model.find(filter).sort(sort).skip(skip).limit(limit);

    if ( populate ) {
        query = query.populate(populate);
    }
    if ( useLean ) {
        query = query.lean();
    }
    if ( select ) {
        query = query.select(select);
    }
    const [data, total] = await Promise.all([
        query.exec(),
        model.countDocuments(filter)
    ]);

    return {
        data,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1
        }
    };
};

module.exports = paginate;
