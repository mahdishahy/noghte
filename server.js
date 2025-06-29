const app = require('./app')
const { setupLogging } = require('./startup/logging')
setupLogging()
const mongoose = require('mongoose')
require('dotenv').config()

const port = process.env.PORT;

( async () => {
    await mongoose.connect(process.env.MONGO_URI)
    global.logger.info('Database Connected ...')
} )()
const x = a + 1
const server = app.listen(port, () => {
    global.logger.info(`Server running on port ${ port }`)
});

process.on('unhandledRejection', (ex) => {
    global.logger.error(`Unhandled Rejection: ${ ex.message }`, ex);
    server.close(() => {
        global.logger.info('Server Closed Due to Unhandled Rejection.');
        process.exit(1)
    })
})

process.on('uncaughtException', (ex) => {
    global.logger.error(`Uncaught Exception: ${ ex.message }`, ex);
    server.close(() => {
        global.logger.info('Server closed due to uncaught exception.');
        process.exit(1);
    });
});