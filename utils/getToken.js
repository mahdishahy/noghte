const jwt = require('jsonwebtoken')

exports.generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "30 day" })
}