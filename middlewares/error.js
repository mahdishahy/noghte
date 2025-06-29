const { StatusCode } = require('http-status-codes');
const AppError = require('./../utils/AppError')

module.exports = (err, req, res, next) => {

    const requestDetails = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
    }

    global.logger.error(err.message, { error: err, request: requestDetails });

    if ( err instanceof AppError ) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })
    }

    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'مشکلی پیش آمده است! لطفاً بعداً دوباره امتحان کنید'
    })
};