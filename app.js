const express = require('express');
const helmet = require('helmet')
const cors = require('cors')
const authRouter = require('./routes/v1/auth')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(helmet())
app.use(cors())

app.get('/', (req, res) => {
    return res.status(200).json({ message: "Welcome to noghte's API" })
})

app.use('/api/v1/auth', authRouter)

module.exports = app