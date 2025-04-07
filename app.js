const express = require('express');
const helmet = require('helmet')
const cors = require('cors')
const authRouter = require('./routes/v1/auth')
const usersRouter = require('./routes/v1/user')
const articlesRouter = require('./routes/v1/article')
const commentsRouter = require('./routes/v1/comment')
const categoriesRouter = require('./routes/v1/category')
const userController = require("./controllers/v1/user");

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(helmet())
app.use(cors())

app.get('/', (req, res) => {
    return res.status(200).json({ message: "Welcome to noghte's API" })
})
app.get(/^\/@([a-zA-Z0-9_]{5,15})$/, userController.getByUserName);
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/articles', articlesRouter)
app.use('/api/v1/comments', commentsRouter)
app.use('/api/v1/categories', categoriesRouter)

module.exports = app