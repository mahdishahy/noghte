const bcrypt = require('bcrypt')

exports.hash = (password, salt = 10) => {
    return bcrypt.hash(password, salt)
}

exports.isValidPassword = (password, mainPassword) => {
    return bcrypt.compare(password, mainPassword)
}

exports.removeOnePropertyInObject = (object, propertyKey) => {
    const newObject = object.toObject()
    Reflect.deleteProperty(newObject, propertyKey)
    return newObject
}