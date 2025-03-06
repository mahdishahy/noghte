const express = require('express');

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    return res.status(200).json({ message: "Welcome to noghte's API" })
})

module.exports = app