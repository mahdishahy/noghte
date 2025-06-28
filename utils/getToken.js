const jwt = require('jsonwebtoken')

exports.generateTokens = (user) => {
    const accessToken = jwt.sign({
        userId: user._id,
        email: user.email
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })

    const refreshToken = jwt.sign({
        userId: user._id,
        email: user.email
    }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' })

    return { accessToken, refreshToken }
}

exports.verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch ( error ) {
        return null;
    }
}

exports.verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch ( error ) {
        return null;
    }
}