module.exports = (req, res, next) => {
    const isAdmin = req.user.role === 'ADMIN'
    if ( isAdmin ) {
        return next()
    }
    return res.status(403).json({ message: 'دسترسی غیر مجاز' })
}